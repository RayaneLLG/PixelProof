/**
 * PixelProof — Accessible, Semantic Link Component
 * Renders standard <a href="..."> elements for search crawlability,
 * intercepting internal navigation without full-page reloads.
 */

import React from 'react';
import { useRouter } from './Router';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  className?: string;
  children: React.ReactNode;
}

export function Link({ to, className, children, onClick, ...props }: LinkProps) {
  const { navigate, currentPath } = useRouter();

  const isExternal = to.startsWith('http://') || to.startsWith('https://') || to.startsWith('mailto:');
  const isActive = currentPath === to;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Allow standard browser behaviors: middle-click, cmd/ctrl-click, alt-click, shift-click
    if (
      !e.defaultPrevented &&
      !isExternal &&
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey
    ) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      aria-current={isActive ? 'page' : undefined}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  );
}
