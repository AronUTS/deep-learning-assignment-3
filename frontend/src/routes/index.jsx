import { Routes, Route } from 'react-router-dom';
import UploadVideo from '../pages/UploadVideo';
import UploadTasks from '../pages/UploadTasks';
import VideoAnalysis from '../pages/VideoAnalysis';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<UploadVideo />} />
      <Route path="/tasks" element={<UploadTasks />} />
      <Route path="/analysis" element={<VideoAnalysis />} />
      <Route path="*" element={<UploadVideo />} />
    </Routes>
  );
}
