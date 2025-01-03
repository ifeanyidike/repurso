// stores/ThemeStore.ts
import { makeAutoObservable } from 'mobx';

class ThemeStore {
    isDarkTheme = true;

    constructor() {
        makeAutoObservable(this);
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
    }
}

export const themeStore = new ThemeStore();
