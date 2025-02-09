import React from 'react';
import { ClerkProvider, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { Receipt, ArrowRightCircle, Coins, Users, BarChart3, Shield } from 'lucide-react';
import ExpenseTracker from './components/ExpenseTracker';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-2xl mb-8">
            <Receipt className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Expense Buddy
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Who Owes Who? Never Forget Again! 💸
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative p-6 bg-white rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Coins className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Track Money Flow</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Easily record money given & received because memories fade, but debts don't!
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative p-6 bg-white rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Friend Management</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Add friends & see who owes what - no more awkward reminders needed!
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative p-6 bg-white rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Instant Updates</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Get instant balance updates so you don't need a calculator anymore!
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative p-6 bg-white rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Secure & Reliable</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Secure login & cloud storage because sticky notes get lost!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl font-medium text-gray-900 mb-8">
              No more financial mysteries—just pure friendship & accountability! 🚀
            </p>
            <button
              onClick={() => document.getElementById('sign-in-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors duration-200"
            >
              Get Started
              <ArrowRightCircle className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div id="sign-in-section" className="py-12">
        <div className="min-h-[600px] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Start tracking expenses with your friends
            </p>
          </div>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <SignIn />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <WelcomePage />;
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