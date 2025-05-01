import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import VideoConsultation from "@/pages/video-consultation";
import PatientHistory from "@/pages/patient-history";
import AppointmentScheduling from "@/pages/appointment-scheduling";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  // You can add authentication logic here to protect routes
  const isAuthenticated = true; // This would normally be determined by checking auth state
  
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Login />
        </Route>
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/consultation/:id" component={VideoConsultation} />
        <Route path="/patient/:id" component={PatientHistory} />
        <Route path="/appointments" component={AppointmentScheduling} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
