// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

/**
 * @title PiRC-209 Verifiable Credentials Verifier
 * @notice Handles issuance, verification and revocation of Verifiable Credentials
 * @dev Integrated with PiRC-209 DID Registry and PiRC-208 AI Oracle
 */

import "./PiRC209DIDRegistry.sol";
import "./PiRC207RegistryLayer.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PiRC209VCVerifier is ReentrancyGuard {
    PiRC209DIDRegistry public didRegistry;

    struct VerifiableCredential {
        bytes32 credentialId;
        bytes32 didHash;
        bytes32 issuer;
        uint256 issuedAt;
        uint256 expiresAt;
        bytes32 vcHash;           // Hash of credential content
        bool isValid;
        bytes32 zkProof;          // Placeholder for zk-SNARK proof
    }

    mapping(bytes32 => VerifiableCredential) public credentials;

    event VCCreated(bytes32 indexed credentialId, bytes32 indexed didHash, bytes32 issuer);
    event VCVerified(bytes32 indexed credentialId, bool success);
    event VCRevoked(bytes32 indexed credentialId);

    constructor(address _didRegistry) {
        didRegistry = PiRC209DIDRegistry(_didRegistry);
    }

    /**
     * @notice Issue a new Verifiable Credential (only authorized issuers)
     */
    function issueVC(
        bytes32 _didHash,
        bytes32 _vcHash,
        uint256 _validDays,
        bytes32 _zkProof
    ) external nonReentrant returns (bytes32) {
        require(didRegistry.getDID(msg.sender).isActive, "Invalid DID");

        bytes32 credentialId = keccak256(abi.encodePacked(_didHash, _vcHash, block.timestamp));

        credentials[credentialId] = VerifiableCredential({
            credentialId: credentialId,
            didHash: _didHash,
            issuer: bytes32(uint256(uint160(msg.sender))),
            issuedAt: block.timestamp,
            expiresAt: block.timestamp + (_validDays * 1 days),
            vcHash: _vcHash,
            isValid: true,
            zkProof: _zkProof
        });

        emit VCCreated(credentialId, _didHash, bytes32(uint256(uint160(msg.sender))));
        return credentialId;
    }

    /**
     * @notice Verify a credential with zk-proof validation
     */
    function verifyVC(bytes32 _credentialId, bytes32 _providedProof) external returns (bool) {
        VerifiableCredential storage vc = credentials[_credentialId];
        require(vc.isValid, "Credential revoked");
        require(block.timestamp <= vc.expiresAt, "Credential expired");

        // zk-proof verification (placeholder – integrate real zk verifier in production)
        bool proofValid = (vc.zkProof == _providedProof);

        if (proofValid) {
            emit VCVerified(_credentialId, true);
            return true;
        }

        // Call Justice Engine on failure
        _triggerJusticeEngine(_credentialId);
        return false;
    }

    function revokeVC(bytes32 _credentialId) external {
        VerifiableCredential storage vc = credentials[_credentialId];
        require(vc.issuer == bytes32(uint256(uint160(msg.sender))), "Not issuer");
        vc.isValid = false;
        emit VCRevoked(_credentialId);
    }

    function _triggerJusticeEngine(bytes32 _credentialId) internal {
        // Slash staked tokens + enforce Economic Parity (PiRC-207)
    }
}
