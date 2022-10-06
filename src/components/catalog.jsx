import React, { useState, useMemo } from 'react'
import CatalogCard from './catalog-card'
import './catalog.scss'

const isMobileDevice = () => window.matchMedia('(max-width: 720px)').matches

const Catalog = ({ widgets = [], isLoading = true }) => {
	const [state, setState] = useState({
		searchText: '',
		showingFilters: false,
		activeFilters: [],
		showMobileFilters: false
	})
	const totalWidgets = widgets.length

	// collect all unique features and supported data
	const filters = useMemo(() => {
		const filters = new Set()
		widgets.forEach(w => {
			w.meta_data.features.forEach(f => { filters.add(f) })
			w.meta_data.supported_data.forEach(f => { filters.add(f) })
			if (w.meta_data.hasOwnProperty('accessibility_keyboard')) filters.add('Keyboard Accessible')
			if (w.meta_data.hasOwnProperty('accessibility_reader')) filters.add('Screen Reader Accessible')
		})
		return Array.from(filters)
	},
		[widgets]
	)

	// filter widgets based on search & features
	const [filteredWidgets, isFiltered] = useMemo(() => {
		let isFiltered = false
		let results = widgets
		// filters are active, only match active filters
		if (state.activeFilters.length) {
			isFiltered = true

			// find widgets that have all the active filters
			results = widgets.filter(w => {
				const { features, supported_data, accessibility_keyboard, accessibility_reader } = w.meta_data
				return state.activeFilters.every(f => {
					if (features.includes(f) || supported_data.includes(f)) return true
					if (accessibility_keyboard && f === 'Keyboard Accessible') return true
					if (accessibility_reader && f === 'Screen Reader Accessible') return true

					return false
				})
			})
		}

		// search widget names
		if (state.searchText !== '') {
			isFiltered = true
			const re = new RegExp(state.searchText, 'i')
			results = results.filter(w => re.test(w.name))
		}

		// remove featured  when no search options are enabled
		// (because they are shown in a seperate container)
		if (!isFiltered) results = results.filter(w => w.in_catalog === '0')

		return [results, isFiltered]
	}, [widgets, state.searchText, state.activeFilters])

	const toggleFilter = filter => {
		const newFilters = state.activeFilters.includes(filter)
			? state.activeFilters.filter(f => f != filter)
			: [...state.activeFilters, filter]

		setState({ ...state, activeFilters: newFilters, showMobileFilters: false })
	}

	const filterLinkClickHandler = () => {
		if (state.showingFilters) {
			setState({ ...state, showingFilters: !state.showingFilters, activeFilters: [] })
		}
		else {
			setState({ ...state, showingFilters: !state.showingFilters })
		}
	}

	let searchCloseRender = null
	if (state.searchText) {
		searchCloseRender = (
			<button className='search-close'
				tabIndex='0'
				onClick={() => { setState({ ...state, searchText: '' }) }} />
		)
	}

	let mobileFilterRender = null
	if (state.showMobileFilters) {
		const mobileFilterOptionsRender = filters.map(filter => (
			<label key={filter}>
				<input type='checkbox'
					className='filter-button'
					checked={state.activeFilters.includes(filter)}
					readOnly={true}
					onClick={() => toggleFilter(filter)}
				/>
				{filter}
			</label>
		))

		mobileFilterRender = (
			<div
				id='filter-dropdown'
				className='mobile-only'
				aria-hidden={!isMobileDevice()}>
				{mobileFilterOptionsRender}
			</div>
		)
	}

	const filterOptionsRender = filters.map((filter, index) => {
		const isEnabled = state.activeFilters.includes(filter)
		const filterOptionClickHandler = () => toggleFilter(filter)
		return <button key={index}
			className={'feature-button' + (isEnabled ? ' selected' : '')}
			aria-hidden={!state.showingFilters}
			onClick={filterOptionClickHandler}>
			{filter}
		</button>
	}
	)

	let featuredWidgetsRender = null
	if (!isFiltered && totalWidgets > 0) {
		const featuredWidgetListRender = widgets.filter(w => w.in_catalog === '1')
			.map(w => <CatalogCard {...w} key={w.id} />)
		featuredWidgetsRender = (
			<div className='widget-group'>
				<h1 className='container-label'>
					<span>Featured Widgets</span>
				</h1>
				<div data-testid='featured-widgets' className='widgets-container featured'>
					{featuredWidgetListRender}
				</div>
			</div>
		)
	}

	const filteredWidgetsRender = filteredWidgets.map(w =>
		<CatalogCard {...w} key={w.id} isFiltered activeFilters={state.activeFilters} />
	)

	let loadingOrWarningsRender = null
	if (filteredWidgets.length < 1) {
		const loadingMessageRender = isLoading ? <span>Loading Widgets...</span> : null

		let noWidgetsRender = null
		if (!isLoading) {
			if (isFiltered) {
				noWidgetsRender = (
					<span>
						No widgets match the filters you set.
						<button className='cancel_button'
							onClick={() => {
								setState({ ...state, searchText: '', activeFilters: [] })
							}}>
							Show All
						</button>
					</span>
				)
			} else {
				noWidgetsRender = <span>No Widgets Installed</span>
			}
		}

		loadingOrWarningsRender = (
			<div id='no-widgets-message'>
				{loadingMessageRender}
				{noWidgetsRender}
			</div>
		)
	}

	let filterHiddenRender = null
	if (isFiltered) {
		filterHiddenRender = (
			<div id='hidden-count'>
				{totalWidgets - filteredWidgets.length} hidden by filters.
				<button className='cancel_button'
					onClick={() => {
						setState({ ...state, searchText: '', activeFilters: [] })
					}}>
					Show All
				</button>
			</div>
		)
	}

	return (
		<div className='catalog'>
			<div className='container' id='widget-catalog-container'>
				<section className='page'>

					<div className='top'>
						<h1>Widget Catalog</h1>
						<button
							className='filter-toggle cancel_button desktop-only'
							onClick={filterLinkClickHandler}>
							{state.showingFilters ? 'Clear Filters' : 'Filter by feature'}
						</button>
						<div className={'search' + (state.searchText === '' ? '' : ' not-empty')} >
							<input value={state.searchText} onChange={(e) => { setState({ ...state, searchText: e.target.value }) }} type='text' data-testid='search-bar' />
							<div className='search-icon'>
								<svg viewBox='0 0 250.313 250.313'>
									<path d='m244.19 214.6l-54.379-54.378c-0.289-0.289-0.628-0.491-0.93-0.76 10.7-16.231 16.945-35.66 16.945-56.554 0-56.837-46.075-102.91-102.91-102.91s-102.91 46.075-102.91 102.91c0 56.835 46.074 102.91 102.91 102.91 20.895 0 40.323-6.245 56.554-16.945 0.269 0.301 0.47 0.64 0.759 0.929l54.38 54.38c8.169 8.168 21.413 8.168 29.583 0 8.168-8.169 8.168-21.413 0-29.582zm-141.28-44.458c-37.134 0-67.236-30.102-67.236-67.235 0-37.134 30.103-67.236 67.236-67.236 37.132 0 67.235 30.103 67.235 67.236s-30.103 67.235-67.235 67.235z'
										clipRule='evenodd'
										fillRule='evenodd' />
								</svg>
							</div>
							{searchCloseRender}
						</div>
					</div>

					<div aria-hidden={!isMobileDevice()} id='active-filters' className='mobile-only'>
						<button id='add-filter'
							onClick={() => { setState({ ...state, showMobileFilters: !state.showMobileFilters }) }}>
							{state.activeFilters.length ? 'Filters' : 'Filter by Feature'}
						</button>
						<div>
							{state.activeFilters.join(', ')}
						</div>
					</div>
					{mobileFilterRender}
					<div id='filters-container'
						className={`ready ${state.showingFilters ? 'open' : 'closed'}`}>
						<div className='filter-labels-container'>
							{filterOptionsRender}
						</div>
					</div>

					{featuredWidgetsRender}

					<div data-testid='non-featured-widgets'
						className='widgets-container'>
						{filteredWidgetsRender}
					</div>

					{loadingOrWarningsRender}

					{filterHiddenRender}
				</section>
			</div>
		</div>
	)
}

export default Catalog
