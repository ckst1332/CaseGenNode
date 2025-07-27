import dynamic from 'next/dynamic';

// Load the existing React application which internally handles routing
const App = dynamic(() => import('../src/App.jsx'), { ssr: false });

export default function DashboardPage() {
  // Simply render the React router app. The BrowserRouter inside App
  // will pick up the current URL ("/dashboard") and display the
  // appropriate page. Authentication checks are handled within the
  // Dashboard component itself.
  return <App />;
}
