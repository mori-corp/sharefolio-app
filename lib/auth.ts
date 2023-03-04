import { auth } from '../firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth'
import { useEffect } from 'react'
import { atom, useRecoilState, useRecoilValue } from 'recoil'
import { recoilPersist } from 'recoil-persist'
import { UserType } from '@/types/user'

const { persistAtom } = recoilPersist()

export const userState = atom<UserType>({
  key: 'userState',
  default: {
    uid: '',
    photoUrl: '',
    displayName: '',
  },
  effects_UNSTABLE: [persistAtom],
})

export const useUser = (): UserType => {
  return useRecoilValue(userState)
}

// googleでサインインする
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()

  await signInWithPopup(auth, provider).catch((err) => alert(err.message))
}

// 認証ユーザーの状態管理
export const useAuth = (): UserType => {
  const [authUser, setUser] = useRecoilState(userState)

  useEffect(() => {
    // 認証を感知し、Recoilで状態保持
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          photoUrl: user.photoURL,
          displayName: user.displayName,
        })
      }
    })
  }, [setUser])

  return authUser
}
