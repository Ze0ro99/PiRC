/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Matrix } from "./components/Matrix";
import { Contracts } from "./components/Contracts";
import { Placeholder } from "./components/Placeholder";
import { RepoSync } from "./components/RepoSync";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sync" element={<RepoSync />} />
            <Route path="/matrix" element={<Matrix />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/explorer" element={<Placeholder title="Data Explorer" />} />
            <Route path="/economics" element={<Placeholder title="Economics Simulator" />} />
            <Route path="/layers" element={<Placeholder title="7-Layer Visualizer" />} />
            <Route path="/rwa" element={<Placeholder title="Real World Assets" />} />
            <Route path="/subscriptions" element={<Placeholder title="Subscriptions" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
