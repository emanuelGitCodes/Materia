import { useEffect } from 'react'
import fetchOptions from './fetch-options'
import { useQueryClient } from 'react-query'
import { objectTypes } from '../components/materia-constants'

// checks response for errors and decodes json
const handleErrors = async resp => {
	if (!resp.ok) throw Error(resp.statusText)
	const data = await resp.json()
	if (data?.errorID) {
		throw Error(data.message)
	}
	return data
}

const fetchGet = (url, options = null) => fetch(url, fetchOptions(options)).then(handleErrors)

// Helper function to simplify encoding fetch body values
const formatFetchBody = body => encodeURIComponent(JSON.stringify(body))

export const apiGetWidgetInstance = instId => {
	return fetch(`/api/json/widget_instances_get/`, fetchOptions({ body: `data=${formatFetchBody([instId])}` }))
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return []
			return resp.json()
		})
		.then(widget => {
			if (widget.length > 0) return widget[0]
			else return {}
		})
}

export const apiGetWidgetInstances = () => {
	return fetch(`/api/json/widget_instances_get/`, fetchOptions({ body: `data=${formatFetchBody([])}` }))
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return []
			return resp.json()
		})
		.then(resp => {
			resp.sort(_compareWidgets)
			writeToStorage('widgets', resp)
			return resp
		})
}

export const apiGetInstancesForUser = userId => {
	return fetch(`/api/admin/user/${userId}`)
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return []
			return resp.json()
		})
}

// Helper function to sort widgets
const _compareWidgets = (a, b) => {
	return (new Date(a.created_at) <= new Date(b.created_at))
}

export const apiGetWidgetsByType = () => {
	const options = {
		'headers': {
			'cache-control': 'no-cache',
			'pragma': 'no-cache',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		'body': `data=${formatFetchBody(['all'])}`,
		'method': 'POST',
		'mode': 'cors',
		'credentials': 'include'
	}

	return fetch('/api/json/widgets_get_by_type/', options)
		.then(resp => resp.json())
		.then(widgets => widgets)
}

// Gets widget info
export const apiGetWidget = widgetId => {
	const options = {
		'headers': {
			'cache-control': 'no-cache',
			'pragma': 'no-cache',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		'body': `data=${formatFetchBody([[widgetId]])}`,
		'method': 'POST',
		'mode': 'cors',
		'credentials': 'include'
	}

	return fetch('/api/json/widgets_get/', options)
		.then(resp => resp.json())
		.then(widgets => widgets.length > 0 ? widgets[0] : {})
}

export const apiCopyWidget = values => {
	return fetchGet(`/api/json/widget_instance_copy`, { body: `data=${formatFetchBody([values.instId, values.title, values.copyPermissions])}` })
		.then(widget => {
			return widget
		})
}

export const apiDeleteWidget = ({ instId }) => {
	return fetch('/api/json/widget_instance_delete/', fetchOptions({ body: `data=${formatFetchBody([instId])}` }))
		.then((resp) => {
			if (resp.status === 204 || resp.status === 502) return null
			return resp.json()
		})
}

export const apiUnDeleteWidget = ({ instId }) => {
	return fetch(`/api/admin/widget_instance_undelete/${instId}`,
		{
			method: 'POST',
			mode: 'cors',
			credentials: 'include',
			headers: {
				pragma: 'no-cache',
				'cache-control': 'no-cache',
				'content-type': 'application/json; charset=UTF-8'
			}
		})
		.then((resp) => {
			if (resp.status === 204 || resp.status === 502) return false
			return true
		})
}

export const apiSaveWidget = (_params) => {
	const defaults = {
		qset: null,
		is_draft: null,
		open_at: null,
		close_at: null,
		attempts: null,
		guest_access: null,
		embedded_only: null,
	}

	let params = Object.assign({}, defaults, _params)

	if (params.inst_id != null) {
		// limit args to the the following params
		let args = [
			params.inst_id,
			params.name,
			params.qset,
			params.is_draft,
			params.open_at,
			params.close_at,
			params.attempts,
			params.guest_access,
			params.embedded_only,
		]

		return fetch('/api/json/widget_instance_update/', fetchOptions({ body: `data=${formatFetchBody(args)}` })).then(resp => {
			return resp.json()
		})

	} else {
		let args = [
			params.widget_id,
			params.name,
			params.qset,
			params.is_draft
		]
		return fetch('/api/json/widget_instance_save/', fetchOptions({ body: `data=${formatFetchBody(args)}` })).then(resp => {
			return resp.json()
		})
	}
}

export const apiGetUser = () => {

	return fetchGet('/api/json/user_get', { body: `data=${formatFetchBody([])}` })
		.then(user => {
			if (user.halt) {
				sessionStorage.clear()
				return null
			}

			writeToStorage('user', user)
			return user
		})
}

export const apiGetUsers = arrayOfUserIds => {
	return fetchGet('/api/json/user_get', { body: `data=${formatFetchBody([arrayOfUserIds])}` })
		.then(users => {
			const keyedUsers = {}

			if (Array.isArray(users)) {
				users.forEach(u => { keyedUsers[u.id] = u })
			}

			return keyedUsers
		})
}

export const apiGetUserActivity = ({pageParam = 0}) => {
	return fetch(`/api/user/activity?start=${pageParam * 6}`)
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return []
			return resp.json()
		})
}

export const apiAuthorSuper = () => {
	return fetchGet('/api/json/session_author_verify/', { body: `data=${formatFetchBody(['super_user'])}` })
		.then(user => user)
		.catch(error => false)
}

export const apiAuthorSupport = () => {
	return fetchGet('/api/json/session_author_verify/', { body: `data=${formatFetchBody(['support_user'])}` })
		.then(user => user)
		.catch(error => false)
}

export const apiAuthorVerify = () => {
	return fetchGet('/api/json/session_author_verify/', { body: `data=${formatFetchBody([])}` })
		.then(user => user)
		.catch(error => false)
}

export const apiUpdateUserSettings = (settings) => {
	return fetch('/api/user/settings', {
		...fetchOptions({}),
		headers: {
			pragma: 'no-cache',
			'cache-control': 'no-cache',
			'content-type': 'application/json'
		},
		body: JSON.stringify(settings)
	})
		.then((resp) => resp.json())
}

export const apiGetNotifications = () => {
	return fetch('/api/json/notifications_get/', fetchOptions({ body: `data=${formatFetchBody([])}` }))
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return {}
			return resp
		})
		.then(notifications => notifications)
}

export const apiDeleteNotification = notifId => {
	return fetch('/api/json/notification_delete/', fetchOptions({ body: `data=${formatFetchBody([notifId])}` }))
		.then((resp) => resp.json())
}

export const apiGetExtraAttempts = instId => {
	return fetch(`/api/admin/extra_attempts/${instId}`)
		.then(resp => {
			if (resp.status != 200) return []
			return resp.json()
		})
		.then(attemps => {
			const map = new Map()
			for (const i in attemps) {
				map.set(parseInt(attemps[i].id),
					{
						id: parseInt(attemps[i].id),
						user_id: parseInt(attemps[i].user_id),
						context_id: attemps[i].context_id,
						extra_attempts: parseInt(attemps[i].extra_attempts)
					})
			}
			//const userIds = Array.from(attemps, user => user.user_id)
			return map
		})
}

export const apiSetAttempts = ({ instId, attempts }) => {
	return fetch(`/api/admin/extra_attempts/${instId}`,
		{
			method: 'POST',
			mode: 'cors',
			credentials: 'include',
			headers: {
				pragma: 'no-cache',
				'cache-control': 'no-cache',
				'content-type': 'application/json; charset=UTF-8'
			},
			body: JSON.stringify(attempts)
		})
}

export const apiSearchUsers = (input = '') => {
	return fetch('/api/json/users_search', fetchOptions({ body: `data=${formatFetchBody([input])}` }))
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return []
			return resp.json()
		})
		.then(users => users)
}

export const apiGetUserPermsForInstance = instId => {
	return fetch('/api/json/permissions_get', fetchOptions({ body: `data=${formatFetchBody([objectTypes.WIDGET_INSTANCE, instId])}` }))
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return null
			return resp.json()
		})
		.then(perms => perms)
}

export const apiSetUserInstancePerms = ({ instId, permsObj }) => {
	return fetch('/api/json/permissions_set', fetchOptions({ body: `data=${formatFetchBody([objectTypes.WIDGET_INSTANCE, instId, permsObj])}` }))
}

export const apiCanEditWidgets = arrayOfWidgetIds => {
	return fetch('/api/json/widget_instance_edit_perms_verify', fetchOptions({ body: `data=${formatFetchBody([arrayOfWidgetIds])}` }))
		.then(res => res.json())
		.then(widgetInfo => widgetInfo)
}

export const apiUpdateWidget = ({ args }) => {
	return fetch('/api/json/widget_instance_update', fetchOptions({ body: `data=${formatFetchBody(args)}` }))
		.then(res => res.json())
		.then(widget => widget)
}

export const apiGetWidgetLock = (id = null) => {
	return fetch('/api/json/widget_instance_lock', fetchOptions({ body: `data=${formatFetchBody([id])}` }))
		.then(res => res.json())
		.then(lock => lock)
}

export const apiSearchWidgets = input => {
	let pattern = /[A-Za-z]+/g
	if ( !input.match(pattern).length) return false
	return fetch(`/api/admin/widget_search/${input}`)
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return []
			return resp.json()
		})
		.then(widgets => widgets)
}

export const apiGetWidgetsAdmin = () => {
	return fetch(`/api/admin/widgets/`)
		.then(resp => resp.json())
		.then(widgets => widgets)
}

export const apiUpdateWidgetAdmin = widget => {
	return fetch(`/api/admin/widget/${widget.id}`,
	{
		method: 'POST',
		mode: 'cors',
		credentials: 'include',
		headers: {
			pragma: 'no-cache',
			'cache-control': 'no-cache',
			'content-type': 'application/json; charset=UTF-8'
		},
		body: JSON.stringify(widget)
	})
	.then(res => res.json())
}

export const apiUploadWidgets = (files) => {
	const formData = new FormData()

	Array.from(files).forEach(file => {
		formData.append('files[]', file, file.name)
		formData.append('content-type', 'multipart/form-data')
	})

	return fetch(`/admin/upload`, {
		method: 'POST',
		mode: 'cors',
		credentials: 'include',
		headers: {
			'pragma': 'no-cache',
			'cache-control': 'no-cache'
		},
		body: formData
	}).then(res => res)
}

export const apiGetWidgetInstanceScores = (instId, send_token) => {
	return fetch('/api/json/widget_instance_scores_get', fetchOptions({ body: `data=${formatFetchBody([instId, send_token])}` }))
		.then(res => res.json())
		.then(scores => scores)
}


export const apiGetGuestWidgetInstanceScores = (instId, playId) => {
	return fetch('/api/json/guest_widget_instance_scores_get', fetchOptions({ body: `data=${formatFetchBody([instId, playId])}` }))
		.then(res => res.json())
		.then(scores => scores)
}

export const apiGetWidgetInstancePlayScores = (playId, previewInstId) => {
	return fetch('/api/json/widget_instance_play_scores_get', fetchOptions({ body: `data=${formatFetchBody([playId, previewInstId])}` }))
		.then(res => res.json())
}

export const apiGetScoreDistribution = instId => {
	return fetch('/api/json/score_raw_distribution_get', fetchOptions({ body: `data=${formatFetchBody([instId])}` }))
		.then(res => res.json())
		.then(scores => scores)
}

export const apiGetScoreSummary = instId => {
	const options = {
		'headers': {
			'cache-control': 'no-cache',
			'pragma': 'no-cache',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		'body': `data=${formatFetchBody([instId, true])}`,
		'method': 'POST',
		'mode': 'cors',
		'credentials': 'include'
	}

	return fetch('/api/json/score_summary_get/', options)
		.then(resp => {
			if (resp.ok && resp.status !== 204 && resp.status !== 502) return resp.json()
			return []
		})
		.then(scores => {
			const ranges = [
				'0-9',
				'10-19',
				'20-29',
				'30-39',
				'40-49',
				'50-59',
				'60-69',
				'70-79',
				'80-89',
				'90-100',
			]

			scores.forEach(semester => {
				semester.graphData = semester.distribution?.map((d, i) => ({ label: ranges[i], value: d }))
				semester.totalScores = semester.distribution?.reduce((total, count) => total + count)
			})

			return scores
		})
}

export const apiGetPlayLogs = (instId, term, year) => {
	return fetch('/api/json/play_logs_get', fetchOptions({ body: `data=${formatFetchBody([instId, term, year])}` }))
		.then(resp => {
			if (resp.ok && resp.status !== 204 && resp.status !== 502) return resp.json()
			return []
		})
		.then(results => {
			if (results.length == 0) return []

			const timestampToDateDisplay = timestamp => {
				const d = new Date(parseInt(timestamp, 10) * 1000)
				return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear()
			}

			const scoresByUser = new Map()
			results.forEach(log => {
				let scoresForUser
				if (!scoresByUser.has(log.user_id)) {
					// initialize user
					const name = log.first === null ? 'All Guests' : `${log.first} ${log.last}`
					scoresForUser = {
						userId: log.user_id,
						name,
						searchableName: name.toLowerCase(),
						scores: []
					}
					scoresByUser.set(log.user_id, scoresForUser)
				} else {
					// already initialized
					scoresForUser = scoresByUser.get(log.user_id)
				}

				// append to scores
				scoresForUser.scores.push({
					elapsed: parseInt(log.elapsed, 10) + 's',
					playId: log.id,
					score: log.done === '1' ? Math.round(parseFloat(log.perc)) + '%' : '---',
					date: timestampToDateDisplay(log.time)
				})
			})

			const logs = Array.from(scoresByUser, ([name, value]) => value)
			return logs
		})
}

export const apiGetStorageData = instId => {
	return fetch('/api/json/play_storage_get', fetchOptions({ body: `data=${formatFetchBody([instId])}` }))
		.then(resp => {
			if (resp.ok && resp.status !== 204 && resp.status !== 502) return resp.json()
			return {}
		})
		.then(results => results)
}

// Widget player api calls
export const apiGetPlaySession = ({ widgetId }) => {
	return fetch('/api/json/session_play_create/', fetchOptions({ body: `data=${formatFetchBody([widgetId])}` }))
		.then(resp => {
			if (resp.ok && resp.status !== 204 && resp.status !== 502) return resp.json()
			return null
		})
}

export const apiGetQuestionSet = (instId, playId = null) => {
	return fetch('/api/json/question_set_get/', fetchOptions({ body: `data=${formatFetchBody([instId, playId])}` }))
		.then(qset => qset.json())
}

export const apiGetQuestionSetHistory = (instId) => {
	return fetch(`/api/instance/history?inst_id=${instId}`)
		.then(resp => {
			if (resp.status === 204 || resp.status === 502) return []
			return resp.json()
		})
}

export const apiSavePlayStorage = ({ play_id, logs }) => {
	return fetch('/api/json/play_storage_data_save/', fetchOptions({ body: `data=${formatFetchBody([play_id, logs])}` }))
		.then(resp => resp.json())
}

export const apiSavePlayLogs = ({ request }) => {
	return fetch('/api/json/play_logs_save/', fetchOptions({ body: `data=${formatFetchBody(request)}` }))
		.then(resp => {
			if (resp.status !== 504) return resp.json()
			return null
		})
}

export const apiGetQuestionsByType = (arrayOfQuestionIds, arrayOfQuestionTypes) => {
	return fetch('/api/json/questions_get', fetchOptions({ body: `data=${formatFetchBody([arrayOfQuestionIds, arrayOfQuestionTypes])}` }))
		.then(resp => {
			if (resp.status !== 200) return []
			return resp.json()
		})
}

// Persist to wherever using the super-secret object
const writeToStorage = (queryKey, data) => {
	let storageData = window.sessionStorage.getItem('queries');

	storageData = {
		...JSON.parse(storageData || '{}'),
		[queryKey]: data,
	}

	sessionStorage.setItem('queries', JSON.stringify(storageData))
}

// Hydrate from sessionStorage
export const readFromStorage = () => {
	const queryClient = useQueryClient()

	useEffect(() => {
		const storageData = window.sessionStorage.getItem('queries');

		if (storageData !== null) {
			const queriesWithData = JSON.parse(storageData);

			for (const queryKey in queriesWithData) {
				const data = queriesWithData[queryKey];

				queryClient.setQueryData(queryKey, data);
				queryClient.invalidateQueries(queryKey)
			}
		}
	}, [])
}

// Returns boolean, true if the current user can publish the given widget instance, false otherwise
export const apiCanBePublishedByCurrentUser = (widgetId) => {
	return fetch('/api/json/widget_publish_perms_verify',  fetchOptions({ body: `data=${formatFetchBody([widgetId])}` }))
		.then(resp => resp.json())
}
