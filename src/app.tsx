import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { FileDown, Filter, MoreHorizontal, Plus, Search } from 'lucide-react';

import { TagResponse } from './@types/Tag';

import { Tabs } from './components/tabs';
import { Header } from './components/header';
import { Pagination } from './components/pagination';
import { Button } from './components/ui/button';
import { Control, Input } from './components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';

export function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterParams = searchParams.get('filter') ?? '';

  const [filter, setFilter] = useState(filterParams);

  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const perPage = searchParams.get('per_page') ? Number(searchParams.get('per_page')) : 10;

  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    queryKey: ['get-tags', filterParams, perPage, page],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/tags?_page=${page}&_per_page=${perPage}&title=${filterParams}`);
      const data = await response.json();

      return data;
    },
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return null;
  }

  function handleFilter() {
    setSearchParams(params => {
      params.set('page', '1');
      params.set('filter', filter);

      return params;
    });
  }

  return (
    <div className="py-10 space-y-8">
      <div className="">
        <Header />
        <Tabs />
      </div>
      <main className="max-w-[1200px] mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Tags</h1>
          <Button variant="primary">
            <Plus className="size-3" />
            Create new
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Input
              variant="filter"
            >
              <Search className="size-3" />
              <Control
                placeholder="Search tags..."
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
            </Input>
            <Button onClick={handleFilter}>
              <Filter className="size-3" />
              Filter
            </Button>
          </div>

          <Button>
            <FileDown className="size-3"/>
            Export
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Amount of videos</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tagsResponse?.data.map(tag => {
              return (
                <TableRow key={tag.id}>
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-zinc-300">{tag.title}</span>
                      <span className="text-zinc-500">{tag.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {tag.amountOfVideos} video(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon">
                      <MoreHorizontal />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {tagsResponse && <Pagination pages={tagsResponse.pages} items={tagsResponse.items} page={page} perPage={perPage} />}
      </main>
    </div>
  );
}
