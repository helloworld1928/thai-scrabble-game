import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BoardThemeProvider } from "./contexts/BoardThemeContext";
import Home from "./pages/Home";
import Game from "./pages/Game";
import History from "./pages/History";
import Shop from "./pages/Shop";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/game/:id"} component={Game} />
      <Route path={"/history"} component={History} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <BoardThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BoardThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
