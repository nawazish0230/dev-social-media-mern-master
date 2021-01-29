import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { addLike, removeLike, deletePost } from '../../actions/post';

const PostItem = (
    {
        auth, 
        addLike, 
        removeLike,
        deletePost, 
        post: {_id, text, name, avatar, user, likes, comments, date},
        showActions
    }) => {
    return (
        <div className="post bg-white p-1 my-1">
            <div>
            <Link to={`/profile/${user}`}>
                <img
                className="round-img"
                src={avatar} 
                alt=""
                />
                <h4>{name}</h4>
            </Link>
            </div>
            <div>
            <p className="my-1">{text}</p>
            <p className="post-date">
                Posted on <Moment format='YYYY/MM/DD'>{date}</Moment>
            </p>
            {showActions && <Fragment>
                <button type="button" onClick={e => addLike(_id)} className="btn btn-light">
                <i className="fa fa-thumbs-up"></i>
                <span>{likes.length  > 0 && (
                    <span className='comment-count'>{likes.length}</span>
                )}</span>
                </button>
                <button type="button" onClick={e => removeLike(_id)} className="btn btn-light">
                    <i className="fa fa-thumbs-down"></i>
                </button>
                <Link to={`/posts/${_id}`} className="btn btn-primary">
                    Discussion {comments.length  > 0 && (
                        <span className='comment-count'>{comments.length}</span>
                    )}
                </Link>
                {!auth.loading && user === auth.user._id && (
                <button type="button" onClick={e => deletePost(_id)} className="btn btn-danger">
                    <i className="fa fa-times"></i>
                </button>
                )}
            </Fragment>}
        </div>
        </div>
    )
}

PostItem.defaultProps = {
    showActions: true
}

PostItem.propTypes = {
    post: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    addLike: PropTypes.func.isRequired,
    removeLike: PropTypes.func.isRequired,
    deletePost: PropTypes.func.isRequired,
}
const mapStateToProps = state => ({
    auth: state.auth
})

export default connect(mapStateToProps, {addLike, removeLike, deletePost})(PostItem);