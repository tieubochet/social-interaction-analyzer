
import React from 'react';

type IconProps = {
    className?: string;
};

export const IconLink: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M9 15l6 -6"></path>
        <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"></path>
        <path d="M13 18l-.397 .534a5 5 0 0 1 -7.071 -7.072l.534 -.464"></path>
    </svg>
);

export const IconScan: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M4 8v-2a2 2 0 0 1 2 -2h2"></path>
        <path d="M4 16v2a2 2 0 0 0 2 2h2"></path>
        <path d="M16 4h2a2 2 0 0 1 2 2v2"></path>
        <path d="M16 20h2a2 2 0 0 0 2 -2v-2"></path>
        <path d="M5 12l14 0"></path>
    </svg>
);

export const IconUsersGroup: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
       <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1"></path>
       <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
       <path d="M17 10h2a2 2 0 0 1 2 2v1"></path>
       <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
       <path d="M3 13v-1a2 2 0 0 1 2 -2h2"></path>
    </svg>
);

export const IconUserCheck: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
       <path d="M6 21v-2a4 4 0 0 1 4 -4h4"></path>
       <path d="M15 19l2 2l4 -4"></path>
    </svg>
);

export const IconUserPlus: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
        <path d="M16 19h6"></path>
        <path d="M19 16v6"></path>
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4"></path>
    </svg>
);
