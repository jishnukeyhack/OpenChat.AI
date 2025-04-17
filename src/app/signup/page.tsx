'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {useRouter} from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import {auth} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const FormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

export default function SignupPage(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignup = async (data: z.infer<typeof FormSchema>) => {
    try {
      await createUserWithEmailAndPassword(auth!, data.email, data.password);
      toast({
        title: 'Signup Successful',
        description: 'Your account has been created.',
      });
      router.push('/'); // Redirect to home page after signup
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
      console.error('Signup failed:', error);
    }
  };

  const handleOAuthSignup = async (provider: string) => {
    if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Firebase Authentication is not properly initialized.',
        });
        return;
    }
    let oAuthProvider;
    switch (provider) {
      case 'google':
        oAuthProvider = new GoogleAuthProvider();
        break;
      case 'facebook':
        oAuthProvider = new FacebookAuthProvider();
        break;
      case 'github':
        oAuthProvider = new GithubAuthProvider();
        break;
      default:
        toast({
          variant: 'destructive',
          title: 'OAuth Error',
          description: 'Invalid provider.',
        });
        return;
    }

    try {
      await signInWithPopup(auth, oAuthProvider);
      toast({
        title: 'Signup Successful',
        description: `You have successfully signed up with ${provider}.`,
      });
      router.push('/'); // Redirect to home page after signup
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'OAuth Signup Failed',
        description: error.message,
      });
      console.error(`OAuth signup with ${provider} failed:`, error);
    }
  };

 const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
        await createUserWithEmailAndPassword(auth!, data.email, data.password);
        toast({
            title: 'Signup Successful',
            description: 'Your account has been created.',
        });
        router.push('/'); // Redirect to home page after signup
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: error.message,
        });
        console.error('Signup failed:', error);
    }
  };

 return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-6">
          <Button onClick={() => router.push('/login')}>Log In</Button>
          <Button onClick={() => router.push('/signup')}>Sign Up</Button>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your email below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Sign Up</Button>
              </form>
            </Form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="flex w-full justify-center gap-2">
              <Button type="button" variant="outline" onClick={() => handleOAuthSignup('google')} className="w-full">
                Google
              </Button>
              <Button type="button" variant="outline" onClick={() => handleOAuthSignup('facebook')} className="w-full">
                Facebook
              </Button>
              <Button type="button" variant="outline" onClick={() => handleOAuthSignup('github')} className="w-full">
                Github
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

