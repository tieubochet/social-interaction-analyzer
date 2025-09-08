
import type { User } from '../types';

// Mock database of users the current user is following
const MOCK_FOLLOWING_LIST: string[] = [
  'react_dev', 'tailwind_guru', 'typescript_pro', 'nodejs_ninja', 'dev_humor',
  'frontend_master', 'ux_designer', 'code_artist', 'js_enthusiast'
];

// Mock list of users who interacted with the post
const MOCK_INTERACTING_USERS: User[] = [
  { id: '1', username: 'react_dev', avatarUrl: 'https://picsum.photos/seed/1/100' },
  { id: '2', username: 'vue_fan', avatarUrl: 'https://picsum.photos/seed/2/100' },
  { id: '3', username: 'tailwind_guru', avatarUrl: 'https://picsum.photos/seed/3/100' },
  { id: '4', username: 'css_wizard', avatarUrl: 'https://picsum.photos/seed/4/100' },
  { id: '5', username: 'typescript_pro', avatarUrl: 'https://picsum.photos/seed/5/100' },
  { id: '6', username: 'random_user123', avatarUrl: 'https://picsum.photos/seed/6/100' },
  { id: '7', username: 'dev_humor', avatarUrl: 'https://picsum.photos/seed/7/100' },
  { id: '8', username: 'angular_advocate', avatarUrl: 'https://picsum.photos/seed/8/100' },
  { id: '9', username: 'ux_designer', avatarUrl: 'https://picsum.photos/seed/9/100' },
  { id: '10', username: 'code_newbie', avatarUrl: 'https://picsum.photos/seed/10/100' },
  { id: '11', username: 'js_enthusiast', avatarUrl: 'https://picsum.photos/seed/11/100' },
  { id: '12', username: 'backend_bob', avatarUrl: 'https://picsum.photos/seed/12/100' },
  { id: '13', username: 'data_scientist', avatarUrl: 'https://picsum.photos/seed/13/100' },
  { id: '14', username: 'frontend_master', avatarUrl: 'https://picsum.photos/seed/14/100' },
  { id: '15', username: 'design_dave', avatarUrl: 'https://picsum.photos/seed/15/100' },
];

/**
 * Simulates scanning a post's interactions and categorizing users.
 * @param url The URL of the post to scan (not actually used in this mock).
 * @returns A promise that resolves with categorized user lists.
 */
export const scanPostInteractions = (
  url: string
): Promise<{ followed: User[]; notFollowed: User[] }> => {
  console.log(`Scanning URL: ${url}`); // To show it's being called

  return new Promise((resolve) => {
    setTimeout(() => {
      const followed: User[] = [];
      const notFollowed: User[] = [];

      MOCK_INTERACTING_USERS.forEach((user) => {
        if (MOCK_FOLLOWING_LIST.includes(user.username)) {
          followed.push(user);
        } else {
          notFollowed.push(user);
        }
      });

      // Sort alphabetically for consistent display
      followed.sort((a, b) => a.username.localeCompare(b.username));
      notFollowed.sort((a, b) => a.username.localeCompare(b.username));

      resolve({ followed, notFollowed });
    }, 2000); // Simulate a 2-second network delay
  });
};
