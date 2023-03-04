export type PostType = {
  id: string
  appName: string
  title: string
  description: string
  image: string
  level: string
  language: Array<string>
  appUrl: string
  github: string
  postedDate: number | null
  authorId: string
}
