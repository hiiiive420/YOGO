import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import { fetchBlogById, updateBlog } from '../../api/blogs';
import { getApiError } from '../../api/client';
import BlogForm from '../../components/admin/blogs/BlogForm';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminBlogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  async function handleUpdate(formData) {
    try {
      await updateBlog(id, formData);
      showToast({ type: 'success', title: 'Blog updated' });
      navigate('/admin/blogs');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: getApiError(error),
      });
    }
  }

  return (
    <section>
      <AdminPageHeader
        kicker="Blogs"
        title={blog?.title ? `Edit ${blog.title}` : 'Edit Blog'}
        description="Update article content, imagery, SEO fields, and related locations."
        action={<BackLink />}
      />

      {isLoading && (
        <div className="grid min-h-72 place-items-center rounded-lg border border-black/10 bg-white">
          <Loader2 className="animate-spin text-cinnamon" size={28} />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={loadBlog}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            <RefreshCcw size={17} />
            Retry
          </button>
        </div>
      )}

      {!isLoading && blog && (
        <BlogForm initialValues={blog} mode="edit" onSubmit={handleUpdate} />
      )}
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/blogs"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
