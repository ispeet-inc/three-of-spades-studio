import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GameLoadingSpinner } from "./components/LoadingSpinner";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <Suspense fallback={<GameLoadingSpinner />}>
          <App />
        </Suspense>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);