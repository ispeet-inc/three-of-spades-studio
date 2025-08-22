import { store } from "@/store";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GameLoadingSpinner } from "./components/LoadingSpinner";
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
