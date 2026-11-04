#!/usr/bin/env python3
"""Offline-first PiRC validation runner for Termux. No signing, deployment or network writes."""
import argparse, datetime as dt, json, os, re, subprocess, sys
from decimal import Decimal
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"artifacts"/"termux-reports"
def result(ok,name,detail=""):
    return {"name":name,"status":"PASS" if ok else "FAIL","detail":detail}
def command(args,timeout=900):
    try:
        p=subprocess.run(args,cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=timeout)
        return {"command":" ".join(args),"exit_code":p.returncode,"output":p.stdout[-8000:]}
    except FileNotFoundError:
        return {"command":" ".join(args),"exit_code":127,"output":"Optional tool not installed"}
    except subprocess.TimeoutExpired:
        return {"command":" ".join(args),"exit_code":124,"output":"Timed out"}
def json_check():
    files=[]
    for folder in ("schemas","registries","fixtures"):
        base=ROOT/folder
        if base.exists():
            for p in base.rglob("*.json"):
                json.loads(p.read_text(encoding="utf-8")); files.append(str(p.relative_to(ROOT)))
    return result(bool(files),"json_documents_parse",f"{len(files)} JSON files parsed")
def economics():
    pi,pe=Decimal("314159"),Decimal("0.0314159")
    R,C,P,L=map(Decimal,("1000000","400000","50000","100000"))
    D=max(Decimal(0),R-C-P-L)
    w=[Decimal(1),Decimal(2),Decimal(3)]
    shares=[D*x/sum(w) for x in w]
    return [
      result(pi/pe==Decimal("10000000"),"dual_value_ratio_exact",str(pi/pe)+" (scenario arithmetic only)"),
      result(D==Decimal("450000"),"distributable_surplus",f"D=max(0,R-C-P-L)={D}"),
      result(sum(shares)==D,"allocation_conservation",f"shares sum to {sum(shares)}"),
      result(all(x>=0 for x in shares),"allocation_non_negative")]
def secret_scan():
    patterns=[re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
              re.compile(r"gh[pousr]_[A-Za-z0-9]{30,}")]
    hits=[]
    for folder in (".github","scripts","docs","schemas","registries"):
        base=ROOT/folder
        if base.exists():
            for p in base.rglob("*"):
                if p.is_file() and p.suffix.lower() in {".py",".sh",".yml",".yaml",".json",".toml",".md",".ts",".js"}:
                    text=p.read_text(encoding="utf-8",errors="ignore")
                    if any(x.search(text) for x in patterns): hits.append(str(p.relative_to(ROOT)))
    return result(not hits,"tracked_secret_pattern_scan","No high-confidence key patterns found" if not hits else "Review files: "+", ".join(hits))
def health(name,url,rpc=False):
    if not url:return {"name":name,"status":"SKIP","detail":"Not configured"}
    try:
        data=json.dumps({"jsonrpc":"2.0","id":1,"method":"getHealth"}).encode() if rpc else None
        req=Request(url,data=data,headers={"Content-Type":"application/json","Accept":"application/json"})
        with urlopen(req,timeout=12) as r:
            body=r.read(1200).decode(errors="replace")
            return {"name":name,"status":"PASS" if r.status==200 else "FAIL","detail":f"HTTP {r.status}: {body[:250]}"}
    except (URLError,HTTPError,TimeoutError,ValueError) as e:
        return {"name":name,"status":"FAIL","detail":str(e)[:250]}
def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--network-smoke",action="store_true",help="Read-only HTTP / getHealth checks; no writes")
    a=ap.parse_args()
    checks=[json_check(),*economics(),
      result((ROOT/"docs/economics/INTERNAL_EXTERNAL_VALUE_BRIDGE_SPEC.md").exists(),"economic_bridge_spec"),
      result((ROOT/"docs/integration/IMPLEMENTATION_TRACEABILITY_MATRIX.md").exists(),"traceability_matrix"),
      secret_scan()]
    if a.network_smoke:
        checks += [
          health("Pi Testnet Horizon",os.getenv("PI_HORIZON_URL","https://api.testnet.minepi.com")),
          health("Pi Testnet Soroban RPC",os.getenv("PI_SOROBAN_RPC_URL","https://rpc.testnet.minepi.com"),True),
          health("Stellar Testnet Horizon",os.getenv("STELLAR_HORIZON_URL","https://horizon-testnet.stellar.org")),
          health("Stellar Testnet Soroban RPC",os.getenv("STELLAR_SOROBAN_RPC_URL","https://soroban-testnet.stellar.org"),True)]
    cmds=[]
    if (ROOT/"tests").exists():
        cmds.append(command([sys.executable,"-m","pytest","-q"]))
    if (ROOT/"Cargo.toml").exists():
        cmds.append(command(["cargo","test","--workspace","--locked"],1800))
    if (ROOT/"pnpm-lock.yaml").exists():
        cmds.append(command(["pnpm","-r","test"],1800))
    OUT.mkdir(parents=True,exist_ok=True)
    stamp=dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    report={"generated_at":dt.datetime.now(dt.timezone.utc).isoformat(),"network_writes":False,"checks":checks,"commands":cmds}
    (OUT/f"report-{stamp}.json").write_text(json.dumps(report,indent=2)+"\n")
    lines=["# Termux Validation Report","",report["generated_at"],"","> No signing, transaction submission, deployment, or Mainnet operation was performed.","","## Checks"]
    lines += [f"- **{x['status']}** {x['name']}: {x.get('detail','')}" for x in checks]
    lines += ["","## Local commands"]
    lines += [f"- {x['command']} — exit {x['exit_code']}\n\n    {x['output'][:1500]}" for x in cmds]
    (OUT/f"report-{stamp}.md").write_text("\n".join(lines)+"\n")
    for x in checks: print(x["status"],x["name"],x.get("detail",""))
    for x in cmds: print("EXIT",x["exit_code"],x["command"])
    print("Report:",OUT/f"report-{stamp}.md")
    return int(any(x["status"]=="FAIL" for x in checks) or any(x["exit_code"] not in (0,127) for x in cmds))
if __name__=="__main__": raise SystemExit(main())
