# @backstage/plugin-search-react

## 1.1.0

### Minor Changes

- 97f2b8f3fd: The `<SearchResult/>` component now accepts a optional `query` prop to request results from the search api:

  > Note: If a query prop is not defined, the results will by default be consumed from the context.

  Example:

  ```jsx
  import React, { useState, useCallback } from 'react';

  import { Grid, List, Paper } from '@material-ui/core';

  import { Page, Header, Content, Lifecycle } from '@backstage/core-components';
  import {
    DefaultResultListItem,
    SearchBarBase,
    SearchResult,
  } from '@backstage/plugin-search-react';

  const SearchPage = () => {
    const [query, setQuery] = useState({
      term: '',
      types: [],
      filters: {},
    });

    const handleChange = useCallback(
      (term: string) => {
        setQuery(prevQuery => ({ ...prevQuery, term }));
      },
      [setQuery],
    );

    return (
      <Page themeId="home">
        <Header title="Search" subtitle={<Lifecycle alpha />} />
        <Content>
          <Grid container direction="row">
            <Grid item xs={12}>
              <Paper>
                <SearchBarBase debounceTime={100} onChange={handleChange} />
              </Paper>
            </Grid>
            <Grid item xs>
              <SearchResult query={query}>
                {({ results }) => (
                  <List>
                    {results.map(({ document }) => (
                      <DefaultResultListItem
                        key={document.location}
                        result={document}
                      />
                    ))}
                  </List>
                )}
              </SearchResult>
            </Grid>
          </Grid>
        </Content>
      </Page>
    );
  };
  ```

  Additionally, a search page can also be composed using these two new results layout components:

  ```jsx
  // Example rendering results as list
  <SearchResult>
    {({ results }) => (
      <SearchResultListLayout
        resultItems={results}
        renderResultItem={({ type, document }) => {
          switch (type) {
            case 'custom-result-item':
              return (
                <CustomResultListItem
                  key={document.location}
                  result={document}
                />
              );
            default:
              return (
                <DefaultResultListItem
                  key={document.location}
                  result={document}
                />
              );
          }
        }}
      />
    )}
  </SearchResult>
  ```

  ```jsx
  // Example rendering results as groups
  <SearchResult>
    {({ results }) => (
      <>
        <SearchResultGroupLayout
          icon={<CustomIcon />}
          title="Custom"
          link="See all custom results"
          resultItems={results.filter(
            ({ type }) => type === 'custom-result-item',
          )}
          renderResultItem={({ document }) => (
            <CustomResultListItem key={document.location} result={document} />
          )}
        />
        <SearchResultGroupLayout
          icon={<DefaultIcon />}
          title="Default"
          resultItems={results.filter(
            ({ type }) => type !== 'custom-result-item',
          )}
          renderResultItem={({ document }) => (
            <DefaultResultListItem key={document.location} result={document} />
          )}
        />
      </>
    )}
  </SearchResult>
  ```

  A `SearchResultList` and `SearchResultGroup` components were also created for users who have search pages with multiple queries, both are specializations of `SearchResult` and also accept a `query` as a prop as well:

  ```jsx
  // Example using the <SearchResultList />
  const SearchPage = () => {
    const query = {
      term: 'example',
    };

    return (
      <SearchResultList
        query={query}
        renderResultItem={({ type, document, highlight, rank }) => {
          switch (type) {
            case 'custom':
              return (
                <CustomResultListItem
                  key={document.location}
                  icon={<CatalogIcon />}
                  result={document}
                  highlight={highlight}
                  rank={rank}
                />
              );
            default:
              return (
                <DefaultResultListItem
                  key={document.location}
                  result={document}
                />
              );
          }
        }}
      />
    );
  };
  ```

  ```jsx
  // Example using the <SearchResultGroup /> for creating a component that search and group software catalog results
  import React, { useState, useCallback } from 'react';

  import { MenuItem } from '@material-ui/core';

  import { JsonValue } from '@backstage/types';
  import { CatalogIcon } from '@backstage/core-components';
  import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
  import {
    SearchResultGroup,
    SearchResultGroupTextFilterField,
    SearchResultGroupSelectFilterField,
  } from @backstage/plugin-search-react;
  import { SearchQuery } from '@backstage/plugin-search-common';

  const CatalogResultsGroup = () => {
    const [query, setQuery] = useState<Partial<SearchQuery>>({
      types: ['software-catalog'],
    });

    const filterOptions = [
      {
        label: 'Lifecycle',
        value: 'lifecycle',
      },
      {
        label: 'Owner',
        value: 'owner',
      },
    ];

    const handleFilterAdd = useCallback(
      (key: string) => () => {
        setQuery(prevQuery => {
          const { filters: prevFilters, ...rest } = prevQuery;
          const newFilters = { ...prevFilters, [key]: undefined };
          return { ...rest, filters: newFilters };
        });
      },
      [],
    );

    const handleFilterChange = useCallback(
      (key: string) => (value: JsonValue) => {
        setQuery(prevQuery => {
          const { filters: prevFilters, ...rest } = prevQuery;
          const newFilters = { ...prevFilters, [key]: value };
          return { ...rest, filters: newFilters };
        });
      },
      [],
    );

    const handleFilterDelete = useCallback(
      (key: string) => () => {
        setQuery(prevQuery => {
          const { filters: prevFilters, ...rest } = prevQuery;
          const newFilters = { ...prevFilters };
          delete newFilters[key];
          return { ...rest, filters: newFilters };
        });
      },
      [],
    );

    return (
      <SearchResultGroup
        query={query}
        icon={<CatalogIcon />}
        title="Software Catalog"
        link="See all software catalog results"
        filterOptions={filterOptions}
        renderFilterOption={({ label, value }) => (
          <MenuItem key={value} onClick={handleFilterAdd(value)}>
            {label}
          </MenuItem>
        )}
        renderFilterField={(key: string) => {
          switch (key) {
            case 'lifecycle':
              return (
                <SearchResultGroupSelectFilterField
                  key={key}
                  label="Lifecycle"
                  value={query.filters?.lifecycle}
                  onChange={handleFilterChange('lifecycle')}
                  onDelete={handleFilterDelete('lifecycle')}
                >
                  <MenuItem value="production">Production</MenuItem>
                  <MenuItem value="experimental">Experimental</MenuItem>
                </SearchResultGroupSelectFilterField>
              );
            case 'owner':
              return (
                <SearchResultGroupTextFilterField
                  key={key}
                  label="Owner"
                  value={query.filters?.owner}
                  onChange={handleFilterChange('owner')}
                  onDelete={handleFilterDelete('owner')}
                />
              );
            default:
              return null;
          }
        }
        renderResultItem={({ document, highlight, rank }) => (
          <CatalogSearchResultListItem
            key={document.location}
            result={document}
            highlight={highlight}
            rank={rank}
          />
        )}
      />
    );
  };
  ```

- 18f60427f2: Provides search autocomplete functionality through a `SearchAutocomplete` component.
  A `SearchAutocompleteDefaultOption` can also be used to render options with icons, primary texts, and secondary texts.
  Example:

  ```jsx
  import React, { ChangeEvent, useState, useCallback } from 'react';
  import useAsync from 'react-use/lib/useAsync';

  import { Grid, Paper } from '@material-ui/core';

  import { Page, Content } from '@backstage/core-components';
  import { SearchAutocomplete, SearchAutocompleteDefaultOption} from '@backstage/plugin-search-react';

  const OptionsIcon = () => <svg />

  const SearchPage = () => {
    const [inputValue, setInputValue] = useState('');

    const options = useAsync(async () => {
      // Gets and returns autocomplete options
    }, [inputValue])

    const useCallback((_event: ChangeEvent<{}>, newInputValue: string) => {
      setInputValue(newInputValue);
    }, [setInputValue])

    return (
      <Page themeId="home">
        <Content>
          <Grid container direction="row">
            <Grid item xs={12}>
              <Paper>
                <SearchAutocomplete
                  options={options}
                  inputValue={inputValue}
                  inputDebounceTime={100}
                  onInputChange={handleInputChange}
                  getOptionLabel={option => option.title}
                  renderOption={option => (
                    <SearchAutocompleteDefaultOption
                      icon={<OptionIcon />}
                      primaryText={option.title}
                      secondaryText={option.text}
                    />
                  )}
                />
              </Paper>
            </Grid>
          </Grid>
          {'/* Filters and results are omitted */'}
        </Content>
      </Page>
    );
  };
  ```

- ca8d5a6eae: We noticed a repeated check for the existence of a parent context before creating a child search context in more the one component such as Search Modal and Search Bar and to remove code duplication we extract the conditional to the context provider, now you can use it passing an `inheritParentContextIfAvailable` prop to the `SearchContextProvider`.

  Note: This added property does not create a local context if there is a parent context and in this case, you cannot use it together with `initialState`, it will result in a type error because the parent context is already initialized.

### Patch Changes

- 817f3196f6: Updated React Router dependencies to be peer dependencies.
- d3737da337: Reset page cursor on search filter change
- Updated dependencies
  - @backstage/core-components@0.11.1
  - @backstage/core-plugin-api@1.0.6
  - @backstage/plugin-search-common@1.0.1

## 1.1.0-next.2

### Minor Changes

- 18f60427f2: Provides search autocomplete functionality through a `SearchAutocomplete` component.
  A `SearchAutocompleteDefaultOption` can also be used to render options with icons, primary texts, and secondary texts.
  Example:

  ```jsx
  import React, { ChangeEvent, useState, useCallback } from 'react';
  import useAsync from 'react-use/lib/useAsync';

  import { Grid, Paper } from '@material-ui/core';

  import { Page, Content } from '@backstage/core-components';
  import { SearchAutocomplete, SearchAutocompleteDefaultOption} from '@backstage/plugin-search-react';

  const OptionsIcon = () => <svg />

  const SearchPage = () => {
    const [inputValue, setInputValue] = useState('');

    const options = useAsync(async () => {
      // Gets and returns autocomplete options
    }, [inputValue])

    const useCallback((_event: ChangeEvent<{}>, newInputValue: string) => {
      setInputValue(newInputValue);
    }, [setInputValue])

    return (
      <Page themeId="home">
        <Content>
          <Grid container direction="row">
            <Grid item xs={12}>
              <Paper>
                <SearchAutocomplete
                  options={options}
                  inputValue={inputValue}
                  inputDebounceTime={100}
                  onInputChange={handleInputChange}
                  getOptionLabel={option => option.title}
                  renderOption={option => (
                    <SearchAutocompleteDefaultOption
                      icon={<OptionIcon />}
                      primaryText={option.title}
                      secondaryText={option.text}
                    />
                  )}
                />
              </Paper>
            </Grid>
          </Grid>
          {'/* Filters and results are omitted */'}
        </Content>
      </Page>
    );
  };
  ```

- ca8d5a6eae: We noticed a repeated check for the existence of a parent context before creating a child search context in more the one component such as Search Modal and Search Bar and to remove code duplication we extract the conditional to the context provider, now you can use it passing an `inheritParentContextIfAvailable` prop to the `SearchContextProvider`.

  Note: This added property does not create a local context if there is a parent context and in this case, you cannot use it together with `initialState`, it will result in a type error because the parent context is already initialized.

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.11.1-next.2
  - @backstage/core-plugin-api@1.0.6-next.2

## 1.0.2-next.1

### Patch Changes

- 817f3196f6: Updated React Router dependencies to be peer dependencies.
- Updated dependencies
  - @backstage/core-components@0.11.1-next.1
  - @backstage/core-plugin-api@1.0.6-next.1

## 1.0.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.0.6-next.0
  - @backstage/core-components@0.11.1-next.0
  - @backstage/plugin-search-common@1.0.1-next.0

## 1.0.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.11.0
  - @backstage/core-plugin-api@1.0.5

## 1.0.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.11.0-next.2

## 1.0.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.0.5-next.0
  - @backstage/core-components@0.10.1-next.0

## 1.0.0

### Major Changes

- 7bd7d336b2: This package has been promoted to 1.0. Read more about what it means in [New release: Backstage Search 1.0 blog](https://backstage.io/blog/2022/07/19/releasing-backstage-search-1.0)

### Patch Changes

- 60408ca9d4: Fix search pagination to reset page cursor also when a term is cleared.
- Updated dependencies
  - @backstage/core-components@0.10.0
  - @backstage/plugin-search-common@1.0.0
  - @backstage/core-plugin-api@1.0.4
  - @backstage/theme@0.2.16

## 0.2.2-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.0.4-next.0
  - @backstage/core-components@0.10.0-next.3

## 0.2.2-next.2

### Patch Changes

- 60408ca9d4: Fix search pagination to reset page cursor also when a term is cleared.
- Updated dependencies
  - @backstage/core-components@0.10.0-next.2
  - @backstage/theme@0.2.16-next.1

## 0.2.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.9.6-next.1
  - @backstage/theme@0.2.16-next.0
  - @backstage/plugin-search-common@0.3.6-next.0

## 0.2.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.9.6-next.0

## 0.2.1

### Patch Changes

- 8809159148: Components `<DefaultResultListItem>`, `<SearchBar>` (including `<SearchBarBase>`), `<SearchFilter>` (including `.Checkbox`, `.Select`, and `.Autocomplete` static prop components), `<SearchResult>`, and `<SearchResultPager>` are now exported from `@backstage/plugin-search-react`. They are now deprecated in `@backstage/plugin-search` and will be removed in a future release.
- Updated dependencies
  - @backstage/plugin-search-common@0.3.5
  - @backstage/core-components@0.9.5
  - @backstage/core-plugin-api@1.0.3

## 0.2.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.0.3-next.0
  - @backstage/plugin-search-common@0.3.5-next.0

## 0.2.0

### Minor Changes

- bdbe620797: **BREAKING**: `SearchContextProviderForStorybook` and `SearchApiProviderForStorybook` has been deleted. New mock implementation of the `SearchApi` introduced. If you need to mock the api we recommend you to do the following:

  ```tsx
  import {
    searchApiRef,
    MockSearchApi,
    SearchContextProvider,
  } from '@backstage/plugin-search-react';
  import { TestApiProvider } from '@backstage/test-utils';

  <TestApiProvider apis={[[searchApiRef, new MockSearchApi()]]}>
    <SearchContextProvider>
      <Component />
    </SearchContextProvider>
  </TestApiProvider>;
  ```

### Patch Changes

- 11a46863de: Export `useSearchContextCheck` hook to check if the search context is available
- a307a14be0: Removed dependency on `@backstage/core-app-api`.
- 3a74e203a8: Updated search result components to support rendering content with highlighted matched terms
- Updated dependencies
  - @backstage/core-plugin-api@1.0.2
  - @backstage/plugin-search-common@0.3.4

## 0.2.0-next.2

### Patch Changes

- 3a74e203a8: Updated search result components to support rendering content with highlighted matched terms
- Updated dependencies
  - @backstage/plugin-search-common@0.3.4-next.0
  - @backstage/core-plugin-api@1.0.2-next.1

## 0.2.0-next.1

### Minor Changes

- bdbe620797: **BREAKING**: `SearchContextProviderForStorybook` and `SearchApiProviderForStorybook` has been deleted. New mock implementation of the `SearchApi` introduced. If you need to mock the api we recommend you to do the following:

  ```tsx
  import {
    searchApiRef,
    MockSearchApi,
    SearchContextProvider,
  } from '@backstage/plugin-search-react';
  import { TestApiProvider } from '@backstage/test-utils';

  <TestApiProvider apis={[[searchApiRef, new MockSearchApi()]]}>
    <SearchContextProvider>
      <Component />
    </SearchContextProvider>
  </TestApiProvider>;
  ```

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.0.2-next.0

## 0.1.1-next.0

### Patch Changes

- 11a46863de: Export `useSearchContextCheck` hook to check if the search context is available
- a307a14be0: Removed dependency on `@backstage/core-app-api`.

## 0.1.0

### Minor Changes

- ab230a433f: New search package to hold things the search plugin itself and other frontend plugins (e.g. techdocs, home) depend on.

### Patch Changes

- 7c7919777e: build(deps-dev): bump `@testing-library/react-hooks` from 7.0.2 to 8.0.0
- 076b091113: api-report clean up - the package now exports following additional types:

  `SearchContextProviderProps`
  `SearchContextValue`
  `SearchContextProviderForStorybookProps`
  `SearchApiProviderForStorybookProps`

- e1de8526aa: Versioned search context managed through version-bridge
- Updated dependencies
  - @backstage/core-app-api@1.0.1
  - @backstage/core-plugin-api@1.0.1
  - @backstage/version-bridge@1.0.1
  - @backstage/plugin-search-common@0.3.3

## 0.1.0-next.0

### Minor Changes

- ab230a433f: New search package to hold things the search plugin itself and other frontend plugins (e.g. techdocs, home) depend on.

### Patch Changes

- Updated dependencies
  - @backstage/core-app-api@1.0.1-next.1
  - @backstage/core-plugin-api@1.0.1-next.0
