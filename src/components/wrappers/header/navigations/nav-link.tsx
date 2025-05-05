import clsx from 'clsx';
import Link from 'next/link';
import { IconType } from 'react-icons'

export type NavLinkProps = {
    title: string;
    href: string;
    icon?: IconType;
};

export const NavLink = ({ title, icon: Icon, href }: NavLinkProps) => {
    return (
        <Link href={href} className={clsx('text-[#980341] font-bold capitalize',
            '', 'dark:text-[#ff98d6]')}>
            {title}
            {/* <Icon /> */}
        </Link>
    );
}

