import { useState } from 'react';
import { pico_backend } from 'declarations/pico_backend';
import { Button } from '@/components/ui/button';

function App() {
  const [greeting, setGreeting] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;
    pico_backend.greet(name).then((greeting) => {
      setGreeting(greeting);
    });
    return false;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <img src="/logo2.svg" alt="DFINITY logo" className="mx-auto mb-8 max-w-xs" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name:
            </label>
            <input 
              id="name" 
              alt="Name" 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
          >
            Click Me!
          </Button>
        </form>
        {greeting && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">{greeting}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
