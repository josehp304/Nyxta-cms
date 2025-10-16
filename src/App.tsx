import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BranchList from './components/branches/BranchList';
import BranchForm from './components/branches/BranchForm';
import BranchDetails from './components/branches/BranchDetails';
import GalleryList from './components/gallery/GalleryList';
import EnquiriesList from './components/enquiries/EnquiriesList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="branches" element={<BranchList />} />
          <Route path="branches/new" element={<BranchForm />} />
          <Route path="branches/:id" element={<BranchDetails />} />
          <Route path="branches/:id/edit" element={<BranchForm />} />
          <Route path="gallery" element={<GalleryList />} />
          <Route path="enquiries" element={<EnquiriesList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
