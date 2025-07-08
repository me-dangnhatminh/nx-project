'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shadcn-ui/components/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shadcn-ui/components/form';
import { SignInSchema, type SignInFormData } from '@shared/types/pmms';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: SignInFormData) {
    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/signin', data);
      const status = res.status;
      if (status !== 200) throw new Error('Sign in failed');
      toast('Sign in successful!', { description: 'Welcome back!', duration: 2000 });

      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error('Sign in failed. Please check your credentials and try again.', {
        description: errMsg,
      });
      form.reset();
      setShowPassword(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>Welcome back</CardTitle>
        <CardDescription className='text-center'>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your email'
                      type='email'
                      autoComplete='email'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='Enter your password'
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='current-password'
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex flex-col space-y-2'>
        <div className='text-sm text-center text-muted-foreground'>
          <Link href='/forgot-password' className='text-primary hover:underline'>
            Forgot your password?
          </Link>
        </div>
        <div className='text-sm text-center text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link href='/signup' className='text-primary hover:underline font-medium'>
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
