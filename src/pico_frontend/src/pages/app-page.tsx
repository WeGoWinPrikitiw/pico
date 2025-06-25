import { useState } from "react";
import { pico_backend } from "declarations/pico_backend";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Separator,
} from "@/components/ui";
import { useAsync } from "@/hooks";
import { Send, ArrowLeft } from "lucide-react";

export function AppPage() {
  const [name, setName] = useState("");

  const greetAsync = useAsync((name: string) => pico_backend.greet(name));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nameValue = formData.get("name") as string;

    if (nameValue.trim()) {
      greetAsync.execute(nameValue);
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold">Welcome to PiCO</h1>
            <p className="text-muted-foreground">
              Test the Internet Computer backend integration
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!name.trim() || greetAsync.loading}
                >
                  {greetAsync.loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Greeting
                    </>
                  )}
                </Button>
              </div>
            </form>

            {greetAsync.error && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg">
                <p className="text-sm">Error: {greetAsync.error.toString()}</p>
              </div>
            )}

            {greetAsync.data && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Response:</p>
                <p className="text-lg mt-1">{greetAsync.data}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
