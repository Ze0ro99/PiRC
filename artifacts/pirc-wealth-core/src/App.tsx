/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { Layout } from "./components/Layout";

const Dashboard = lazy(() => import("./components/Dashboard").then((m) => ({ default: m.Dashboard })));
const Matrix = lazy(() => import("./components/Matrix").then((m) => ({ default: m.Matrix })));
const Contracts = lazy(() => import("./components/Contracts").then((m) => ({ default: m.Contracts })));
const Placeholder = lazy(() => import("./components/Placeholder").then((m) => ({ default: m.Placeholder })));
const RepoSync = lazy(() => import("./components/RepoSync").then((m) => ({ default: m.RepoSync })));
const Subscriptions = lazy(() => import("./components/Subscriptions").then((m) => ({ default: m.Subscriptions })));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Suspense
            fallback={
              <div role="status" className="rounded-xl border border-white/10 bg-[#111111] px-4 py-6 text-sm text-slate-300">
                Loading PiRC workspace...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sync" element={<RepoSync />} />
              <Route path="/matrix" element={<Matrix />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/explorer" element={<Placeholder title="Data Explorer" />} />
              <Route path="/economics" element={<Placeholder title="Economics Simulator" />} />
              <Route path="/layers" element={<Placeholder title="7-Layer Visualizer" />} />
              <Route path="/rwa" element={<Placeholder title="Real World Assets" />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
