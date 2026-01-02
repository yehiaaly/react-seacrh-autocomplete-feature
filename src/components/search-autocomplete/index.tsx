import { CircleX, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useCallback, useEffect, useState } from "react";
import type { Users } from "@/types/users";
import { Input } from "../ui/input";
import { Item, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import { Spinner } from "../ui/spinner";

const SearchAutoComplete = () => {
  const [searchInput, setSearchInput] = useState("");
  const [usersData, setUsersData] = useState<Users | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  //Add types

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(false);

      const res = await fetch(
        "https://dummyjson.com/users?select=firstName,lastName&limit=1000",
        { signal },
      );

      if (!res.ok) return setError(true);

      const data: Users = await res.json();

      setUsersData(data);
      console.log(data);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("✅ Request cancelled safely");
      } else {
        console.log("❌ Real error:", e);
        setError(true);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchUsers(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchUsers]);

  const filteredUsers =
    usersData?.users.filter((user) => {
      const searchTerm = searchInput.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm)
      );
    }) || [];

  const usersToDisplay = searchInput === "" ? usersData?.users : filteredUsers;
  const noResultsFound = searchInput !== "" && filteredUsers.length === 0;

  return (
    <div className="flex min-h-screen justify-center bg-gray-300">
      <Card className="my-6 flex w-md flex-col gap-2 border-none bg-gray-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Search className="text-primary h-6 w-6" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <Input
            className="hover:shadow-md"
            type="text"
            placeholder="search users"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            required
          />

          {error && (
            <Item className="flex justify-center">
              <ItemMedia>
                <CircleX size={15} />
              </ItemMedia>
              <ItemTitle>Error Fetching the Data</ItemTitle>
            </Item>
          )}
          {loading ? (
            <Item className="flex justify-center">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemTitle>Loading...</ItemTitle>
            </Item>
          ) : noResultsFound ? (
            <Item className="flex justify-center">
              <ItemTitle>No users found matching "{searchInput}"</ItemTitle>
            </Item>
          ) : (
            <Item className="my-4 h-auto max-h-screen overflow-y-auto pr-2">
              <ItemContent className="flex flex-col gap-1">
                {usersToDisplay?.map((user) => (
                  <Item
                    key={user.id}
                    className="rounded-lg border-none hover:bg-gray-200"
                    size="sm"
                  >
                    <ItemTitle>
                      {user.firstName} {user.lastName}
                    </ItemTitle>
                  </Item>
                ))}
              </ItemContent>
            </Item>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchAutoComplete;
