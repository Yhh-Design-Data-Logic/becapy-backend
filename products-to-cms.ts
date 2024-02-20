interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: Category;
    image: string;
    rating: Rating;
}

const enum Category {
    Electronics = 'electronics',
    Jewelery = 'jewelery',
    MenSClothing = "men's clothing",
    WomenSClothing = "women's clothing",
}

interface Rating {
    rate: number;
    count: number;
}

/**
 * Populate CMS Data from an external API.
 */
window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
    'cmsload',
    async (listInstances: CMSList[]) => {
      
        // Get the list instance
        const [listInstance] = listInstances;

        // Save a copy of the template
        const [firstItem] = listInstance.items;
        const itemTemplateElement = firstItem.element;

        // Fetch external data
        const products = await fetchProducts();

        // Remove existing items
        listInstance.clearItems();

        // Create the new items
        const newItems = products.map((product) => createItem(product, itemTemplateElement));

        // Populate the list
        await listInstance.addItems(newItems);

        // // Get the template filter
        // const filterTemplateElement = filtersInstance.form.querySelector<HTMLLabelElement>('[data-element="filter"]');
        // if (!filterTemplateElement) return;

        // // Get the parent wrapper
        // const filtersWrapper = filterTemplateElement.parentElement;
        // if (!filtersWrapper) return;

        // // Remove the template from the DOM
        // filterTemplateElement.remove();

        // // Collect the categories
        // const categories = collectCategories(products);

        // // Create the new filters and append the to the parent wrapper
        // for (const category of categories) {
        //     const newFilter = createFilter(category, filterTemplateElement);
        //     if (!newFilter) continue;

        //     filtersWrapper.append(newFilter);
        // }

        // Sync the CMSFilters instance with the new created filters
        // filtersInstance.storeFiltersData();
    },
]);

/**
 * Fetches fake products from Fake Store API.
 * @returns An array of {@link Product}.
 */
const fetchProducts = async () => {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data: Product[] = await response.json();

        return data;
    } catch (error) {
        return [];
    }
};

/**
 * Creates an item from the template element.
 * @param product The product data to create the item from.
 * @param templateElement The template element.
 *
 * @returns A new Collection Item element.
 */
const createItem = (product: Product, templateElement: HTMLDivElement) => {
    // Clone the template element
    const newItem = templateElement.cloneNode(true) as HTMLDivElement;

    // Query inner elements
    const image = newItem.querySelector<HTMLImageElement>('[data-element="image"]');
    const title = newItem.querySelector<HTMLHeadingElement>('[data-element="title"]');
    const category = newItem.querySelector<HTMLDivElement>('[data-element="category"]');
    const description = newItem.querySelector<HTMLParagraphElement>('[data-element="description"]');

    // Populate inner elements
    if (image) image.src = product.image;
    if (title) title.textContent = product.title;
    if (category) category.textContent = product.category;
    if (description) description.textContent = product.description;

    return newItem;
};

/**
 * Collects all the categories from the products' data.
 * @param products The products' data.
 *
 * @returns An array of {@link Product} categories.
 */
const collectCategories = (products: Product[]) => {
    const categories: Set<Product['category']> = new Set();

    for (const { category } of products) {
        categories.add(category);
    }

    return [...categories];
};

/**
 * Creates a new radio filter from the template element.
 * @param category The filter value.
 * @param templateElement The template element.
 *
 * @returns A new category radio filter.
 */
const createFilter = (category: Product['category'], templateElement: HTMLLabelElement) => {
    // Clone the template element
    const newFilter = templateElement.cloneNode(true) as HTMLLabelElement;

    // Query inner elements
    const label = newFilter.querySelector('span');
    const radio = newFilter.querySelector('input');

    if (!label || !radio) return;

    // Populate inner elements
    label.textContent = category;
    radio.value = category;

    return newFilter;
};





export interface CMSFilters {
  /**
   * Defines the `Form Block` element that hold all filters.
   */
  readonly formBlock: HTMLDivElement;

  /**
   * Defines a {@link CMSList} instance. See `cmscore` docs for more info.
   */
  readonly listInstance: CMSList;

  /**
   * The <form> element that holds all filters.
   */
  readonly form: HTMLFormElement;

  /**
   * An element where the amount of matching results is displayed.
   */
  readonly resultsElement: HTMLElement;

  /**
   * Stores the fields that each reset button has control of.
   */
  readonly resetButtonsData: Map<HTMLElement, string[]>;

  /**
   * A `<input type="submit">` button.
   */
  readonly submitButton?: HTMLInputElement;

  /**
   * The filters data.
   */
  filtersData: FilterData[];

  /**
   * Defines if any filter is currently active.
   */
  filtersActive?: boolean;

  /**
   * Defines if the submit button is visible.
   */
  submitButtonVisible: boolean;

  /**
   * Defines if the filters query must be printed in the Address bar.
   */
  readonly showQueryParams: boolean;

  /**
   * Defines the global active CSS class to apply on active filters.
   */
  readonly activeCSSClass: string;

  /**
   * Defines the global debouncing to apply to all filters.
   */
  readonly debouncing: number;

  /**
   * Defines if all results should be highlighted.
   */
  readonly highlightAll: boolean;

  /**
   * Defines the global highlight CSS class to appy on highlighted elements.
   */
  readonly highlightCSSClass: string;

  /**
   * Stores the data of all filters.
   * @returns The stored {@link FiltersData}.
   */
  storeFiltersData(): FilterData[];

  /**
   * Mutates each `CMSItem`'s state to define if it should be displayed or not.
   *
   * @param addingItems Defines if new items are being added.
   * In that case, the rendering responsibilities are handled by another controller.
   *
   * @param syncTags Defines if the {@link CMSTags} instance should be syncronized. Defaults to `true`.
   */
  applyFilters(addingItems?: boolean, syncTags?: boolean): Promise<void>;

  /**
   * Resets the active filters.
   * @param filterKey If passed, only this filter key will be resetted.
   * @param value If passed, only that specific value and the elements that hold it will be cleared.
   */
  resetFilters(filterKeys?: string[], value?: string): Promise<void>;
}

interface FilterData {
  /**
   * The elements that filter by the `filterKeys` of this filter.
   */
  elements: FilterElement[];

  /**
   * The `filterKey` indentifiers.
   */
  originalFilterKeys: string[];

  /**
   * The normalized `filterKey` indentifiers.
   */
  filterKeys: string[];

  /**
   * The current active values.
   */
  values: Set<string>;

  /**
   * The matching rule.
   */
  match?: 'any' | 'all';

  /**
   * A specific filtering mode.
   */
  mode?: 'range';

  /**
   * Defines if matching `CMSItemProps` should be highlighted.
   */
  highlight: boolean;

  /**
   * Defines the Highlight CSS Class to add to highlight targets.
   */
  highlightCSSClass: string;

  /**
   * Defines an override for the tag format of the filter.
   */
  tagFormat?: 'category';

  /**
   * Defines an override for the identifier display in the `category` tag format.
   */
  tagCategory: string | null;
}

/**
 * Filters
 */
interface FilterElement {
  /**
   * Defines the element that holds the filter value.
   */
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  /**
   * The filter value.
   */
  value: string;

  /**
   * The Form Field type of the element.
   */
  type: string;

  /**
   * The amount of results for this particular element.
   */
  resultsCount: number;

  /**
   * An text element where to display the `resultsCount`.
   */
  resultsElement?: HTMLElement | null;

  /**
   * Defines if the element should be hidden when there are no `resultsCount`.
   */
  hideEmpty?: HTMLElement;

  /**
   * Defines if the element is currently hidden.
   */
  hidden: boolean;

  /**
   * Defines a filtering mode for the element's properties.
   */
  mode?: 'from' | 'to';

  /**
   * Defines the Active CSS Class to add when the element is active.
   */
  activeCSSClass: string;

  /**
   * Defines the debouncing for this specific element.
   */
  debouncing: number;
}



export interface CMSList {
    /**
     * The `Collection List Wrapper` element.
     */
    wrapper: HTMLDivElement;
  
    /**
     * The `Collection List` element.
     */
    list?: HTMLDivElement | null;
  
    /**
     * The `Pagination` wrapper element.
     */
    paginationWrapper?: HTMLDivElement | null;
  
    /**
     * The `Page Count` element.
     */
    paginationCount?: HTMLDivElement | null;
  
    /**
     * The `Previous` button.
     */
    paginationPrevious?: HTMLAnchorElement | null;
  
    /**
     * The `Next` button.
     */
    paginationNext?: HTMLAnchorElement | null;
  
    /**
     * An element used as scroll anchor.
     */
    scrollAnchor?: HTMLElement;
  
    /**
     * An element that displays the total amount of items in the list.
     */
    itemsCount?: HTMLElement;
  
    /**
     * An element that displays the amount of visible items.
     */
    visibleCount?: HTMLElement;
  
    /**
     * A custom `Initial State` element.
     */
    initialElement?: HTMLElement | null;
  
    /**
     * A custom `Empty State` element.
     */
    emptyElement?: HTMLElement | null;
  
    /**
     * Defines if the `Empty State` is currently active (no valid elements to show).
     */
    emptyState: boolean;
  
    /**
     * A custom loader element.
     */
    loader?: HTMLElement;
  
    /**
     * Defines the total amount of pages in the list.
     */
    totalPages: number;
  
    /**
     * Defines if rendered items should be paginated.
     */
    paginationActive: boolean;
  
    /**
     * Defines the current page in `Pagination` mode.
     */
    currentPage?: number;
  
    /**
     * Defines the query key for the paginated pages.
     * @example '5f7457b3_page'
     */
    pagesQuery?: string;
  
    /**
     * Defines if the pagination query param should be added to the URL when switching pages.
     * @example '?5f7457b3_page=1'
     */
    showPaginationQuery: boolean;
  
    /**
     * An array holding all {@link CMSItem} instances of the list.
     */
    items: CMSItem[];
  
    /**
     * An array holding all unsorted {@link CMSItem} instances of the list.
     */
    originalItemsOrder: CMSItem[];
  
    /**
     * Defines the amount of items per page.
     */
    itemsPerPage: number;
  
    /**
     * Defines the amount of items per page.
     */
    originalItemsPerPage: number;
  
    /**
     * An array holding all valid {@link CMSItem} instances of the list.
     * Items are set to valid/invalid by `cmsfilter` when performing any filter query.
     */
    validItems: CMSItem[];
  
    /**
     * Defines if the entire `window.Webflow` instance must be restarted when rendering items.
     * If set, individual modules ('ix2', 'commerce', 'lightbox') will also be restarted.
     */
    restartWebflow: false;
  
    /**
     * Defines if the Webflow `ix2` module must be restarted when rendering items.
     */
    restartIx: false;
  
    /**
     * Defines if the Webflow `commerce` module must be restarted when rendering items.
     */
    restartCommerce: false;
  
    /**
     * Defines if the Webflow `lightbox` module must be restarted when rendering items.
     */
    restartLightbox: false;
  
    /**
     * Defines if the Webflow `slider` module must be restarted when rendering items.
     */
    restartSliders: false;
  
    /**
     * Defines if the Webflow `tabs` module must be restarted when rendering items.
     */
    restartTabs: false;
  
    /**
     * Stores new Collection Items in the instance.
     *
     * @param itemElements The new `Collection Item` elements to store.
     * @param method Defines the storing method:
     *
     * - `unshift`: New items are added to the beginning of the store.
     * - `push`: New items are added to the end of the store.
     *
     * Defaults to `push`.
     */
    addItems(itemElements: HTMLElement[], method?: 'unshift' | 'push'): Promise<void>;
  
    /**
     * Restores the original items order.
     */
    restoreItemsOrder(): void;
  
    /**
     * Clears all stored {@link CMSItem} instances from the list.
     *
     * @param removeElements Defines if the {@link CMSItem.element} nodes should be removed from the DOM.
     * Defaults to `true`.
     */
    clearItems(removeElements?: boolean): void;
  
    /**
     * Recalculates the list object model based on the current props of the items
     * and triggers de correspondent mutations.
     *
     * @param animateItems Defines if the rendered items should be animated.
     * @param animateList Defines if the list should be animated.
     *
     * @returns The rendered items.
     */
    renderItems(animateItems?: boolean, animateList?: boolean): Promise<CMSItem[]>;
  
    /**
     * Shows / hides the requested element.
     * If the `listAnimation` exists, it uses that animation.
     *
     * @param elementKey The element to show/hide.
     * @param show The action to perform, `true` to show, `false` to hide. Defaults to `true`.
     * @param animate Defines if the transition should be animated. Defaults to `true`.
     */
    displayElement(
      elementKey:
        | 'wrapper'
        | 'list'
        | 'emptyElement'
        | 'initialElement'
        | 'paginationNext'
        | 'paginationPrevious'
        | 'loader',
      show?: boolean,
      animate?: boolean
    ): Promise<void>;
  
    /**
     * Switches the current page.
     *
     * @param targetPage The target page to set.
     *
     * @param renderItems Defines if the list should be re-rendered.
     * If `false`, the rendering responsibilities should be handled by another controller.
     *
     * @returns An awaitable Promise that resolves after the list has re-rendered.
     */
    switchPage(targetPage: number, renderItems?: boolean): Promise<void>;
  
    /**
     * Scrolls to the anchor element of the list.
     */
    scrollToAnchor(): void;
  
    /**
     * @returns An attribute value, if exists on the `Collection List Wrapper` or the `Collection List`.
     * @param attributeKey The key of the attribute
     */
    getAttribute(attributeKey: string): string | null | undefined;
  
    /**
     * Gets the instance of the list for a specific attribute key.
     * @param key The attribute key. Example: `fs-cmsfilter-element`.
     *
     * @example 'fs-cmsfilter-element="list-2"' // Returns 2.
     */
    getInstanceIndex(key: string): number | undefined;
  }
  
  interface CMSItem {
    /**
     * The `Collection Item` element.
     */
    element: HTMLDivElement;
  
    /**
     * The `Collection List` parent element.
     */
    list: HTMLDivElement;
  
    /**
     * The element's current index in the rendered list.
     */
    currentIndex?: number;
  
    /**
     * The URL of the item's `Template Page`.
     */
    href?: string;
  
    /**
     * The item's properties.
     * Defined by {@link CMSItemProps}.
     */
    props: CMSItemProps;
  
    /**
     * Defines if the item is valid to be rendered.
     */
    valid: boolean;
  
    /**
     * Promise that fulfills when the item is rendered to the DOM.
     */
    rendering?: Promise<void>;
  
    /**
     * Promise that fulfills when the item's render animation is fully finished.
     */
    animating?: Promise<void>;
  
    /**
     * Defines if the item needs a Webflow modules restart.
     */
    needsWebflowRestart: boolean;
  
    /**
     * Collects the props from child elements and stores them.
     * @param attributeKeys The attribute keys to use to collect the props.
     * @returns Nothing, it mutates the passed `CMSItem` instances.
     */
    collectProps({ fieldKey, typeKey, rangeKey }: { fieldKey: string; typeKey?: string; rangeKey?: string }): void;
  }
  
  interface CMSItemProps {
    [key: string]: {
      /**
       * Defines the prop values.
       */
      values: Set<string>;
  
      /**
       * Defines the elements that hold the prop values.
       * The Map is used as [propValue, data].
       */
      elements: Map<
        string,
        {
          /**
           * The prop element.
           */
          element: HTMLElement;
  
          /**
           * Stores the original outer HTML of the element before any mutations.
           */
          originalHTML: string;
        }
      >;
  
      /**
       * Defines filter values to highlight in a Map like:
       * ```
       * [propValue, data]
       * ```
       */
      highlightData?: Map<string, { filterValue?: string; highlightCSSClass: string }>;
  
      /**
       * Defines the type of the value.
       * @example `date`
       */
      type?: string | null;
  
      /**
       * Defines the mode of the prop.
       * @example `from` | `to`.
       */
      range?: string | null;
    };
  }


  declare global {
    interface Window {
      fsAttributes: FsAttributes;
      FsAttributes: FsAttributes;
    }
  }
  
  type FsAttributesCallback =
    | [
        'cmsload' | 'cmsnest' | 'cmscombine' | 'cmsprevnext' | 'cmsslider' | 'cmssort' | 'cmstabs',
        (value: CMSList[]) => void
      ]
    | ['cmsfilter', (value: CMSFilters[]) => void];
  
  type FsAttributesBase = {
    push: (...args: FsAttributesCallback[]) => void;
  
    cms: {
      coreVersion?: string;
      listElements?: HTMLDivElement[];
      listInstances?: CMSList[];
      filtersInstances?: CMSFilters[];
    };
  };
  
  interface FsAttributeInit<T = unknown> {
    version?: string;
    init?: () => T | Promise<T>;
    loading?: Promise<T>;
    resolve?: (value: T) => void;
  }
  
  type FsAttributesInit = {
    [key: string]: FsAttributeInit;
  };
  
  type FsAttributes = FsAttributesBase & FsAttributesInit;