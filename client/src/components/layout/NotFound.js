import React, {Fragment} from 'react'

export const NotFound = () => {
    return (
        <Fragment>
            <h1 className="x-large text-primary">
                <i className="fa fa-exclamation-triangle"></i>Page Not Found
            </h1>
            <p className="large">This page doesn't exist.</p>
        </Fragment>
    )
}
