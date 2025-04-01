import { atom } from 'recoil';

export const selectedMenuState = atom<number>({
    key: 'selectedMenuState',
    default: 0
})
