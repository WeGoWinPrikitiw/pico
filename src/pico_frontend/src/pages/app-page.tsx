import { useState } from 'react';
import { pico_backend } from 'declarations/pico_backend';
import { Button, Input, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { useAsync } from '@/hooks';

export function AppPage() {
  const [name, setName] = useState('');
  
  const greetAsync = useAsync(
    (name: string) => pico_backend.greet(name)
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nameValue = formData.get('name') as string;
    
    if (nameValue.trim()) {
      greetAsync.execute(nameValue);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo2.svg" alt="DFINITY logo" className="mx-auto mb-6 max-w-xs" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pico Greeter
          </h1>
          <p className="text-gray-600">
            Enter your name to receive a personalized greeting from the Internet Computer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name:
            </label>
            <Input 
              id="name" 
              name="name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name here..."
              disabled={greetAsync.loading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={greetAsync.loading || !name.trim()}
          >
            {greetAsync.loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Greeting...
              </>
            ) : (
              'Get Greeting'
            )}
          </Button>
        </form>

        {greetAsync.error && (
          <div className="mt-6">
            <ErrorMessage 
              message={greetAsync.error} 
              onRetry={() => greetAsync.execute(name)}
            />
          </div>
        )}

        {greetAsync.data && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">{greetAsync.data}</p>
          </div>
        )}

        {greetAsync.data && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                greetAsync.reset();
                setName('');
              }}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 