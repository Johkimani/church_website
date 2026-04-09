function SupportSection() {
  return (
    <section id="support" className='py-12 md:py-24 bg-blue-700 text-white'>
      <div className='max-w-4xl mx-auto px-4 md:px-6 text-center'>
        <h3 className='text-3xl md:text-5xl font-extrabold mb-6 md:mb-8 tracking-tight'>Support Our Growth</h3>
        <p className='text-blue-100 mb-8 md:mb-12 text-base md:text-xl leading-relaxed max-w-2xl mx-auto'>
          Your generous contributions empower our mission to serve the Kirinyaga University community through faith, education, and shared charity.
        </p>

        {/* Donate button */}
        <div>
          <button className='bg-white text-blue-700 hover:bg-gray-100 px-6 md:px-8 py-2 md:py-3 rounded-full font-bold shadow-lg transition-colors text-sm md:text-base'>
            Donate Now
          </button>
        </div>
      </div>
    </section>
  )
}

export default SupportSection
