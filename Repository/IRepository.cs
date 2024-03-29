﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ChatDemoSignalR.Repository
{
    public interface IRepository<TEntity> where TEntity : class
    {
        Task<TEntity> Get(string id);

        Task<TEntity> Get(int id);

        Task<IEnumerable<TEntity>> GetAll();

        IEnumerable<TEntity> Find(Expression<Func<TEntity, bool>> predicate);


        void Add(TEntity entity);

        void AddRange(IEnumerable<TEntity> entities);


        void Remove(TEntity entity);

        void RemoveRange(IEnumerable<TEntity> entities);

    }
}
