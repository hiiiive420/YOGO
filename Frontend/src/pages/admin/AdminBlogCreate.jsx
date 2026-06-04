import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createBlog } from '../../api/blogs';
import { getApiError } from '../../api/client';
import BlogForm from '../../components/admin/blogs/BlogForm';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminBlogCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleCreate(formData) {
    try {
      await createBlog(formData);
      showToast({ type: 'success', title: 'Blog created' });
      navigate('/admin/blogs');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Create failed',
        message: getApiError(error),
      });
    }
  }

  return (
    <section>
      <AdminPageHeader
        kicker="Blogs"
        title="Create Blog"
        description="Create a tourism article with Cloudinary images and related location references."
        action={<BackLink />}
      />
      <BlogForm mode="create" onSubmit={handleCreate} />
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
