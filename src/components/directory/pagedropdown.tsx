import Link from "next/link";
import { useRouter } from "next/router";

export default function PageDropdown({
  pageNum,
  pageCount,
  order,
  withButtons = false,
}: {
  pageNum: number;
  pageCount: number;
  order: string;
  withButtons?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center gap-4">
      {withButtons && (
        <div className="flex-1 flex justify-end">
          {pageNum > 1 && <Link href={`/directory/${order}/${pageNum - 1}`}>Previous</Link>}
        </div>
      )}

      <div className="grow flex justify-center items-center gap-1">
        Page{" "}
        <select
          className="p-2 rounded-md"
          name="order"
          id="order"
          value={pageNum}
          onChange={(e) => router.push(`/directory/${order}/${e.target.value}`)}
        >
          {Array.from(Array(pageCount).keys()).map((n) => (
            <option key={n + 1} value={n + 1}>
              {n + 1}
            </option>
          ))}
        </select>{" "}
        / {pageCount}
      </div>

      {withButtons && (
        <div className="flex-1 flex justify-start">
          {pageCount > pageNum && <Link href={`/directory/${order}/${Math.min(pageNum + 1, pageCount)}`}>Next</Link>}
        </div>
      )}
    </div>
  );
}
