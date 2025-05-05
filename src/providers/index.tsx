
import React, { PropsWithChildren } from 'react'
import GlobalStateProvider from './GlobalStateProvider'
import { ThemeProvider } from 'next-themes';
import FramerMotionProvider from './FramerMotionProvider';
import {
    TooltipProvider
} from "@/components/ui/tooltip"

export default function Providers({ children }: PropsWithChildren) {
    return (
        <TooltipProvider>
            <FramerMotionProvider>
                <ThemeProvider attribute="class" disableTransitionOnChange>
                    <GlobalStateProvider>
                        {children}
                    </GlobalStateProvider>
                </ThemeProvider>
            </FramerMotionProvider>
        </TooltipProvider>
    )
}
