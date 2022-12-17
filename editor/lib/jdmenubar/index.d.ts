// Type definitions for jdmenubar 1.0.0
// Project: https://github.com/midstar/jdmenubar
// Definitions by: Flammrock <https://github.com/Flammrock>
// TypeScript Version: 4.8.4

declare module 'jdmenubar' {
  export type SeparatorItem = {
    separator: boolean
  }
  export type ButtonItem = {
    text: string
    id?: string
    handler?: () => void
    subMenuItems?: Array<ButtonItem | SeparatorItem>
    icon?: string
    shortcut?: string
    enabled?: boolean
  }

  export type MenuItem = ButtonItem | SeparatorItem

  export class MenuBar {
    constructor(element: HTMLElement, options: Array<MenuItem>)
    parseMenuItems(menuElement: HTMLElement, menuItems: Array<MenuItem>)

    // myself is this object. Needed since the method is called as a
    // callback function.
    toggleSubMenu(myself: MenuBar, subMenuElement): void

    // myself is this object. Needed since the method is called as a
    // callback function.
    closeSubMenu(myself: MenuBar, subMenuElement): void

    // myself is this object. Needed since the method is called as a
    // callback function.
    openSubMenu(myself: MenuBar, subMenuElement): void

    // myself is this object. Needed since the method is called as a
    // callback function.
    closeAll(myself: MenuBar): void

    /**
   * Get item with id (value if id property). Useful when updating items
   * in the menu. Call the update() method afterwards to make the change
   * have effect in the menu bar.
   *
   * @param {string} id - Identity of the item
   * @return {Object} - The menuItem object or null if not found
   */
    getItemWithId(id: string) : MenuItem | null

    // Recursive function to traverse all items searching for id.
    getItemWithIdOf(id: string, menuItems: Array<MenuItem>): MenuItem | null

    /**
   * Update menu in case the menuItem objects has changed.
   */
    update(): void
  }
}
