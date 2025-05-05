import clsx from 'clsx'
import React from 'react'
import { GithubIcon, FacebookIcon, LinkedinIcon } from 'lucide-react'
import NavIcon from './nav-icon'
import { NavIconQuickAccess } from './nav-icon-quick-acess'

const IconsGroups = () => {
  return (
    <ul className={clsx('flex items-center w-full justify-end')}>
      <li className={clsx('hidden', 'sm:block')}>
        <NavIcon
          href="https://facebook.com/HuyHK"
          icon={<FacebookIcon className={clsx('h-5 w-5')} />}
          title="Facebook"
        />
      </li>
      <li className={clsx('hidden', 'sm:block')}>
        <NavIcon
          href="https://github.com/HuyHK-2810"
          icon={<GithubIcon className={clsx('h-5 w-5')} />}
          title="GitHub"
        />
      </li>
      <li className={clsx('hidden', 'sm:block')}>
        <NavIcon
          href="https://www.linkedin.com/in/huyhk2810/"
          icon={<LinkedinIcon className={clsx('h-5 w-5')} />}
          title="Linkedin"
        />
      </li>

      <li className={clsx('hidden', 'sm:block')}>
        <div
          className={clsx(
            'ml-2 mr-4 h-3 w-[1px] bg-slate-200',
            'dark:bg-slate-700'
          )}
        />
      </li>
      <li className={clsx('')}>
        <NavIconQuickAccess />
      </li>
    </ul>
  )
}

export default IconsGroups
