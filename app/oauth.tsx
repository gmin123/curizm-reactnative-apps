// app/oauth.tsx
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function OAuthRedirect() {
  useEffect(() => {
    // 토큰 저장은 이미 끝났으니
    // 홈으로 보내기
    router.replace('/(mainpage)');
  }, []);

  return null;
}
