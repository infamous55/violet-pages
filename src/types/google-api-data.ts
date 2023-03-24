export type BookData = {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: [string];
    description?: string;
    publishedDate: string;
    pageCount: number;
  };
};

export type SearchData = {
  totalItems: number;
  items: [
    BookData & {
      searchInfo?: {
        textSnippet: string;
      };
    }
  ];
};
