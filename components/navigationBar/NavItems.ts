type NavItemType = {
  label: string
  children?: Array<NavItemType>
  href?: string
}

export const NAV_ITEMS: Array<NavItemType> = [
  {
    label: '投稿一覧',
    href: '/',
  },
  {
    label: '投稿作成',
    href: '/create',
  },
  {
    label: 'マイページ',
    // ログインしているユーザーのuidを取得して、/mypage/以下に設定することで、ユーザー固有のルーティングを設定する
    href: '/mypage/user',
  },
]
