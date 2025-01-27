import React from 'react';
import { ClerkProvider, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import ExpenseTracker from './components/ExpenseTracker';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AuthenticatedApp() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <SignIn />
          </div>
        </div>
      </div>
    );
  }

  return <ExpenseTracker />;
}

function App() {
  if (!clerkPubKey) {
    return <div>Missing Clerk Publishable Key</div>;
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Toaster position="top-right" />
      <AuthenticatedApp />
    </ClerkProvider>
  );
}

export default App;