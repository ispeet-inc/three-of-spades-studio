import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import GameRedux from "./pages/GameRedux";
import HandTesterPage from "./pages/HandTesterPage";
import NotFound from "./pages/NotFound";
import { store } from "./store";

const queryClient = new QueryClient();

// Wrapper component to extract URL parameter
const GameReduxWrapper = () => {
  const { viewerIndex } = useParams();
  let index = Number(viewerIndex);
  if (isNaN(index) || index < 0 || index > 3) {
    alert("Invalid player index in URL. Defaulting to player 3.");
    index = 3;
  }
  return <GameRedux viewerIndex={index} />;
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GameRedux viewerIndex={3} />} />
            <Route path="/:viewerIndex" element={<GameReduxWrapper />} />
            <Route path="/tester" element={<HandTesterPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
