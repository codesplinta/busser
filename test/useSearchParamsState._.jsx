import '@testing-library/react-hooks/lib/dom/pure'
import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { stubBasicCallback } from './.helpers/test-doubles/stubs'
import { mockEventBusPayload } from './.helpers/test-doubles/mocks'
import { useSearchParamsState } from '../src'
