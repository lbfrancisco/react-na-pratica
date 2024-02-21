export type Tag = {
  title: string;
  amountOfVideos: number;
  id: string;
  slug: string;
}

export type TagResponse = {
  first: number;
  prev: any;
  next: number;
  last: number;
  pages: number;
  items: number;
  data: Tag[];
}
