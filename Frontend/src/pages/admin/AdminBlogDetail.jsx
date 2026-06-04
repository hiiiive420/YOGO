import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Loader2, MapPinned } from 'lucide-react';
import { fetchBlogById } from '../../api/blogs';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminBlogDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [blog, setBlog] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadBlog = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchBlogById(id);
      setBlog(data);
    } catch (error) {
      const message = getApiError(error);
      setErrorMessage(message);
      showToast({ type: 'error', title: 'Could not load blog', message });
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  return (
    <section>
      <AdminPageHeader
        kicker="Blogs"
        title={blog?.title || 'Blog Detail'}
        description="Read-only admin preview of the article and related locations."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/blogs"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
            {blog && (
              <Link
                to={`/admin/blogs/${blog._id}/edit`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
              >
                <Edit3 size={18} />
                Edit
              </Link>
            )}
          </div>
        }
      />

      {isLoading && (
        <div className="grid min-h-72 place-items-center rounded-lg border border-black/10 bg-white">
          <Loader2 className="animate-spin text-cinnamon" size={28} />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          {errorMessage}
        </div>
      )}

      {!isLoading && blog && (
        <article className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="h-[26rem] w-full object-cover"
          />
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_18rem]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cinnamon">
                {blog.slug}
              </p>
              <h2 className="mt-3 font-display text-5xl font-semibold">
                {blog.title}
              </h2>
              <div
                className="mt-6 text-sm leading-8 text-black/66 [&_a]:text-cinnamon [&_strong]:text-obsidian"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
            <aside className="grid content-start gap-4">
              {blog.seoTitle && <Info title="SEO title" value={blog.seoTitle} />}
              {blog.seoDescription && (
                <Info title="SEO description" value={blog.seoDescription} />
              )}
              <div className="rounded-lg border border-black/10 bg-pearl p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cinnamon">
                  <MapPinned size={15} />
                  Locations
                </p>
                <div className="mt-3 grid gap-2">
                  {blog.relatedLocations?.map((location) => (
                    <p key={location._id} className="text-sm font-bold">
                      {location.name}
                    </p>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </article>
      )}
    </section>
  );
}

function Info({ title, value }) {
  return (
    <div className="rounded-lg border border-black/10 bg-pearl p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cinnamon">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-black/62">{value}</p>
    </div>
  );
}
