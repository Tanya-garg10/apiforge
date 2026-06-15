import { ApiPreset } from "./types";

export const API_PRESETS: ApiPreset[] = [
  {
    name: "Get Single Todo",
    description: "Fetches a mock todo item from JSONPlaceholder",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/todos/1",
  },
  {
    name: "List Products",
    description: "Fetches a paginated listing of catalog items from DummyJSON",
    method: "GET",
    url: "https://dummyjson.com/products?limit=5",
  },
  {
    name: "Get Cat Fact",
    description: "Fetches a random playful cat trivia from Cat Facts API",
    method: "GET",
    url: "https://catfact.ninja/fact",
  },
  {
    name: "Eco-Friendly Post",
    description: "Performs an HTTP POST request to create a mock blog article",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: [{ key: "Content-Type", value: "application/json" }],
    bodyType: "json",
    bodyContent: JSON.stringify(
      {
        title: "Building APIForge",
        body: "A modular fully functional API proxy playground.",
        userId: 1,
      },
      null,
      2
    ),
  },
  {
    name: "Mock Headers Inspect",
    description: "Echoes custom request parameters, routes, and headers from HTTPBin",
    method: "GET",
    url: "https://httpbin.org/get?query_demo=APIForge",
    headers: [
      { key: "Accept", value: "application/json" },
      { key: "X-Developer-Platform", value: "AIStudioApplet" },
    ],
  },
];
