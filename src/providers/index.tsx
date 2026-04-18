import { ReactNode } from "react"
import FramerMotionProvider from "./FramerMotionProvider"

export default function Providers({ children }: { children: ReactNode }) {
  return <FramerMotionProvider>{children}</FramerMotionProvider>
}
