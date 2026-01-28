export default jest.fn(() =>
  Promise.resolve({
    pageSize: 5,
    pageNumber: 1,
    totalItemCount: 0,
    records: [],
    locator: null
  })
);
