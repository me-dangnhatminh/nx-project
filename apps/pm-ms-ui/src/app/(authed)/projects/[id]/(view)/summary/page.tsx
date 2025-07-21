export default function SummaryPage() {
  return (
    <section className='w-full h-full relative'>
      <div
        id='summary-header'
        className='w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200'
      >
        <h1 className='block text-2xl font-bold tracking-wide'>Project Summary</h1>
      </div>
      <div id='summary-content' className='p-4 sm:p-6 lg:p-8'>
        {/* Content goes here */}
        <p>Welcome to the project summary page.</p>
      </div>
    </section>
  );
}
