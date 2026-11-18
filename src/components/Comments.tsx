import { Comments } from "@fuma-comment/react";
import "@fuma-comment/react/style.css";

export default function Discussion({ page }: { page: string }) {
  return (
    <Comments
      page={page}
      apiUrl="/api/comments"
      auth={{
        type: "api",
        signIn: () => {
          window.location.href = "https://www.bosbase.com/";
        },
      }}
    />
  );
}
