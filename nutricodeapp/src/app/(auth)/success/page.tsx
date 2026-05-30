import { Redirect } from 'expo-router';

export default function Success() {
  return <Redirect href="/(auth)/signin/page" />;
}